import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://royaldutchsales.com',
  'https://www.royaldutchsales.com',
  'https://arno.blog',
  'https://www.arno.blog',
]

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { getRelevantChunks, formatChunksForPrompt } from '@/lib/rag'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { question, history } = await req.json()
    const origin = req.headers.get('origin')
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null

    // Check IP question count over last 24 hours
    let hint: string | null = null
    if (ip) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from('arnobot_blog_logs')
        .select('*', { count: 'exact', head: true })
        .eq('ip', ip)
        .gte('created_at', since)

      const n = count ?? 0
      if (n >= 4) {
        return NextResponse.json({ blocked: true }, { headers: corsHeaders(origin) })
      }
      if (n === 2) hint = 'last_chance'
      if (n === 3) hint = 'salescanvas'
    }

    const relevant = await getRelevantChunks(question, 10)
    const context = formatChunksForPrompt(relevant)

    const messages = [
      ...(history || []),
      { role: 'user' as const, content: question }
    ]

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: `Je bent Arno Diepeveen. Oprichter Royal Dutch Sales. 20 jaar salesstrateeg. Ongefilterd, provocerend, direct. Geen corporate taal, geen coachtaal, geen bullshit. Je hebt altijd een mening.

Gebruik geen accenten om woorden te benadrukken. Dus niet "écht", "dát", "zó", "dít". Schrijf gewoon: "echt", "dat", "zo", "dit". Accenten die taalkundig horen, zoals in "één", "café" of leenwoorden, zijn wel toegestaan.

Gebruik Engelse termen exact zoals ze in de blogs staan. Nooit vertalen. "Always Be Recruiting" blijft "Always Be Recruiting".

Antwoord zo lang als het onderwerp vraagt. Sluit altijd af met een volledige zin. Maximaal 2000 woorden. Geen bullet points. Gebruik **vet** alleen als het er echt toe doet.

Stel vragen als iemand zelf nog niet heeft nagedacht — maar doe dat als Arno, niet als een methode.

Over blogreferenties: gebruik de blogfragmenten als inhoudelijke basis. Verwijs alleen naar een blog als er een concrete tool, rekensheet of raamwerk in staat dat direct helpt. Noem de titel cursief zonder aanhalingstekens: _The Referral Guy_. Link met markdown: [Lees The Referral Guy](https://arno.blog/blog/referral). Nooit meer dan 1 link.

CONTEXT UIT DE BLOGS:
${context}`,
      messages
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''

    await supabase.from('arnobot_blog_logs').insert({ question, answer, ip })

    return NextResponse.json({ answer, hint }, { headers: corsHeaders(origin) })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Chat error:', msg)
    const origin = req.headers.get('origin')
    return NextResponse.json({ error: msg }, { status: 500, headers: corsHeaders(origin) })
  }
}
