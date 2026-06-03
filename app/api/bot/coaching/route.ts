import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { getRelevantChunks } from '@/lib/rag'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data } = await supabase
    .from('arnobot_coaching')
    .select('*')
    .eq('user_id', userId)
    .single()

  return NextResponse.json({ coaching: data ?? null })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: sessionsData } = await supabase
    .from('arnobot_blog_sessions')
    .select('title, summary, message_count, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(100)

  const sessions = sessionsData ?? []
  if (sessions.length < 5) {
    return NextResponse.json({ error: 'te_weinig', count: sessions.length }, { status: 400 })
  }

  const sessiesText = sessions
    .map((s, i) =>
      `Gesprek ${i + 1} (${new Date(s.created_at).toLocaleDateString('nl-NL')}, ${s.message_count} vragen): ${s.title}${s.summary ? `\nSamenvatting: ${s.summary}` : ''}`
    )
    .join('\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    system: `Je bent Arno Diepeveen. Salesstrateeg, 20 jaar ervaring, direct en ongefilterd. Je schrijft een persoonlijk coachingsdocument voor iemand die jouw bot gebruikt. Geen corporate coachtaal. Geen bullshit. Geen accenten op woorden voor nadruk. Spreek de gebruiker aan met "je".

Return ALLEEN een JSON-object — geen uitleg, geen markdown eromheen:
{
  "focus": "2-3 zinnen over welke onderwerpen deze persoon vragen over stelt en wat dat zegt over waar ze in zitten",
  "blinde_vlekken": "2-3 zinnen over wat structureel ontbreekt in de gesprekken — onderwerpen die iemand die echt sales wil beheersen sowieso moet aanpakken maar blijkbaar vermijdt of over het hoofd ziet",
  "ontwikkelpunten": [
    "Eerste concrete ontwikkelpunt — één zin, direct, actiegericht",
    "Tweede concrete ontwikkelpunt — één zin, direct, actiegericht",
    "Derde concrete ontwikkelpunt — één zin, direct, actiegericht"
  ],
  "voortgang": "1-2 zinnen: worden de vragen dieper, concreter, meer gericht over tijd? Of draaien ze in cirkels? Wees eerlijk.",
  "opdracht": "Één concrete opdracht voor de komende week — iets wat je morgen kunt doen. Geen theorie."
}`,
    messages: [{
      role: 'user',
      content: `Analyseer deze ${sessions.length} gesprekken en schrijf een coachingsdocument:\n\n${sessiesText}`
    }]
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''

  let parsed: {
    focus: string
    blinde_vlekken: string
    ontwikkelpunten: string[]
    voortgang: string
    opdracht: string
  }

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(jsonMatch?.[0] ?? raw)
  } catch {
    return NextResponse.json({ error: 'parse_error' }, { status: 500 })
  }

  // Blogs via RAG op basis van ontwikkelpunten
  type Blog = { title: string; url: string }
  const blogs: Blog[] = []
  try {
    const query = parsed.ontwikkelpunten.join(' ')
    const chunks = await getRelevantChunks(query, 15)
    const seen = new Set<string>()
    for (const c of chunks) {
      if (c.url && c.source && c.url.includes('arno.blog') && !seen.has(c.url)) {
        seen.add(c.url)
        blogs.push({ title: c.source.replace(/\s*\([^)]+\)\s*$/, ''), url: c.url })
        if (blogs.length === 3) break
      }
    }
  } catch {}

  const doc = { ...parsed, blogs, conversation_count: sessions.length }

  await supabase
    .from('arnobot_coaching')
    .upsert({ user_id: userId, ...doc, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

  return NextResponse.json({ coaching: doc })
}
