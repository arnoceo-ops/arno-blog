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

function removeAccents(text: string): string {
  return text
    .replace(/[éèêë]/g, 'e').replace(/[áàâä]/g, 'a').replace(/[óòôö]/g, 'o')
    .replace(/[íìîï]/g, 'i').replace(/[úùûü]/g, 'u')
    .replace(/[ÉÈÊË]/g, 'E').replace(/[ÁÀÂÄ]/g, 'A').replace(/[ÓÒÔÖ]/g, 'O')
    .replace(/[ÍÌÎÏ]/g, 'I').replace(/[ÚÙÛÜ]/g, 'U')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { question, history } = await req.json()

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

Schrijf geen accenten op letters. Geen e met accent aigu of grave, geen trema, geen diakritische tekens. Gewoon: "een", "echt", "een".

Gebruik Engelse termen exact zoals ze in de blogs staan. Nooit vertalen. "Always Be Recruiting" blijft "Always Be Recruiting".

Antwoord zo lang als het onderwerp vraagt. Sluit altijd af met een volledige zin. Maximaal 2000 woorden. Geen bullet points. Gebruik **vet** alleen als het er echt toe doet.

Stel vragen als iemand zelf nog niet heeft nagedacht — maar doe dat als Arno, niet als een methode.

Over blogreferenties: gebruik de blogfragmenten als inhoudelijke basis. Verwijs alleen naar een blog als er een concrete tool, rekensheet of raamwerk in staat dat direct helpt. Noem de titel cursief zonder aanhalingstekens: _The Referral Guy_. Link met markdown: [Lees The Referral Guy](https://arno.blog/blog/referral). Nooit meer dan 1 link.

CONTEXT UIT DE BLOGS:
${context}`,
      messages
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    await supabase.from('arnobot_blog_logs').insert({ question, answer, ip })

    const origin = req.headers.get('origin')
    return NextResponse.json({ answer: removeAccents(answer) }, { headers: corsHeaders(origin) })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Chat error:', msg)
    const origin = req.headers.get('origin')
    return NextResponse.json({ error: msg }, { status: 500, headers: corsHeaders(origin) })
  }
}
