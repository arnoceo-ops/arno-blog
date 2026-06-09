import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
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

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const [sessionsRes, analysesRes, profielRes] = await Promise.all([
    supabase
      .from('arnobot_blog_sessions')
      .select('title, summary, message_count, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(100),
    supabase
      .from('arnobot_analyses')
      .select('analyse_text, created_at, session_count')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('arnobot_blog_profiles')
      .select('profiel')
      .eq('user_id', userId)
      .single(),
  ])

  const sessions = sessionsRes.data ?? []
  if (sessions.length < 5) {
    return NextResponse.json({ error: 'te_weinig', count: sessions.length }, { status: 400 })
  }

  const analyses = analysesRes.data ?? []
  const profiel = profielRes.data?.profiel ?? null
  const profielText = profiel
    ? `\n\nGEBRUIKERSPROFIEL:\nRol: ${profiel.rol || '—'}\nMarkt: ${Array.isArray(profiel.markt) ? profiel.markt.join(', ') : profiel.markt || '—'}\nWat verkoop je: ${profiel.wat_verkoop_je || '—'}\nIdeale klant: ${profiel.ideale_klant || '—'}\nGrootste uitdaging: ${profiel.uitdaging || '—'}`
    : ''

  const sessiesText = sessions
    .map((s, i) =>
      `Gesprek ${i + 1} (${new Date(s.created_at).toLocaleDateString('nl-NL')}, ${s.message_count} vragen): ${s.title}${s.summary ? `\nSamenvatting: ${s.summary}` : ''}`
    )
    .join('\n\n')

  const analysesText = analyses.length > 0
    ? '\n\nEERDERE PATROONANALYSES (meest recent eerst):\n' + analyses
        .map((a, i) =>
          `Analyse ${i + 1} (${new Date(a.created_at).toLocaleDateString('nl-NL')}, ${a.session_count} gesprekken):\n${a.analyse_text}`
        )
        .join('\n\n')
    : ''

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1600,
    system: `Je bent Arno Diepeveen. Salesstrateeg, 20 jaar ervaring, direct en ongefilterd. Je schrijft een persoonlijk coachingsdocument gebaseerd op drie pijlers: Mindset, Systeem en Actie. Geen corporate coachtaal. Geen bullshit. Geen accenten op woorden voor nadruk. Spreek de gebruiker aan met "je".

MINDSET = hoe iemand in de wedstrijd zit. Geloof in zichzelf, zelfimage als verkoper, positief of negatief taalgebruik, excuses maken of verantwoordelijkheid nemen.
SYSTEEM = heeft iemand een verkoopproces? Volgt die dat consequent? Pipeline-denken, opvolging, structuur, terugkomen op dingen. Sales is een proces, geen vak.
ACTIE = doet iemand het ook echt? Gesprekken voeren, initiatief nemen, consistent actief blijven. Een droom zonder actie is een nachtmerrie.

Score elke pijlar op een schaal van 1 (zwak) tot 5 (sterk) op basis van wat de gesprekken onthullen.
Bepaal richting op basis van hoe gesprekken zich over tijd ontwikkelen: worden ze dieper, concreter, meer gericht? Stijgend. Draaien ze in cirkels? Dalend. Geen duidelijke beweging? Stabiel.

Return ALLEEN een JSON-object, geen uitleg, geen markdown eromheen:
{
  "voortgang": "1-2 zinnen: worden de vragen dieper en concreter over tijd, of draaien ze in cirkels? Wees eerlijk.",
  "mindset_score": <getal 1 t/m 5>,
  "mindset_diagnose": "2-3 zinnen over de mindset die je ziet. Wat verraadt het taalgebruik, de vragen, de houding?",
  "mindset_richting": "stijgend",
  "systeem_score": <getal 1 t/m 5>,
  "systeem_diagnose": "2-3 zinnen over het systeemdenken. Zit er structuur in de vragen of is het elke keer ad hoc?",
  "systeem_richting": "stabiel",
  "actie_score": <getal 1 t/m 5>,
  "actie_diagnose": "2-3 zinnen over actiegericht gedrag. Hoe actief is iemand, worden vragen concreter over tijd?",
  "actie_richting": "stijgend",
  "ontwikkelpunten": [
    { "tekst": "Eerste concrete ontwikkelpunt, één zin, direct en actiegericht", "pijlar": "mindset" },
    { "tekst": "Tweede concrete ontwikkelpunt, één zin, direct en actiegericht", "pijlar": "systeem" },
    { "tekst": "Derde concrete ontwikkelpunt, één zin, direct en actiegericht", "pijlar": "actie" }
  ],
  "dringende_suggestie": "Één concrete opdracht voor de komende week, iets wat je morgen kunt doen. Geen theorie.",
  "dringende_suggestie_pijlar": "actie"
}

De richting-waarden mogen alleen zijn: "stijgend", "stabiel" of "dalend".
De pijlar-waarden mogen alleen zijn: "mindset", "systeem" of "actie".`,
    messages: [{
      role: 'user',
      content: `Analyseer deze ${sessions.length} gesprekken${analyses.length > 0 ? ` en ${analyses.length} eerder gemaakte patroonanalyses` : ''} en schrijf een coachingsdocument:${profielText}\n\nGESPREKKEN:\n${sessiesText}${analysesText}`
    }]
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''

  let parsed: {
    voortgang: string
    mindset_score: number
    mindset_diagnose: string
    mindset_richting: string
    systeem_score: number
    systeem_diagnose: string
    systeem_richting: string
    actie_score: number
    actie_diagnose: string
    actie_richting: string
    ontwikkelpunten: { tekst: string; pijlar: string }[]
    dringende_suggestie: string
    dringende_suggestie_pijlar: string
  }

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(jsonMatch?.[0] ?? raw)
  } catch {
    return NextResponse.json({ error: 'parse_error' }, { status: 500 })
  }

  type Blog = { title: string; url: string }
  const blogs: Blog[] = []
  try {
    const query = parsed.ontwikkelpunten.map(p => p.tekst).join(' ')
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
