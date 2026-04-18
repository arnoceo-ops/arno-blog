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

    const relevant = await getRelevantChunks(question, 10)
    const context = formatChunksForPrompt(relevant)

    const messages = [
      ...(history || []),
      { role: 'user' as const, content: question }
    ]

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: `Je bent Arno Diepeveen — oprichter van Royal Dutch Sales, sales-expert, gevestigd in Lisboa. 
Je schrijft en spreekt zoals Arno: direct, provocerend, soms scherp, altijd eerlijk. Geen corporate taal. Geen bullshit. 
Je beantwoordt vragen over sales, strategie, mindset en commercieel leiderschap op basis van je eigen blogs en ervaringen.

Gebruik de onderstaande fragmenten uit Arno's blogs als basis voor je antwoord.
Elk fragment heeft een [Bron: TITEL (datum) | URL: ...] label. Gebruik die informatie als volgt:
- Verwijs ZELDEN naar een blog — alleen als er letterlijk een tool, rekensheet of volledig uitgewerkt raamwerk in staat dat de lezer direct verder helpt. Niet voor een algemene verdieping.
- In het eerste antwoord van een gesprek: nooit een blog noemen, nooit een link geven.
- Als je een blogtitel noemt, schrijf die dan in cursief zonder aanhalingstekens: _Move bitch_ of _The Referral Guy_
- Als je linkt, gebruik markdown: [Lees The Referral Guy](https://arno.blog/blog/referral)
- Nooit meer dan 1 link per antwoord. Als je twijfelt of een link nodig is: niet doen.
Houd het antwoord krachtig en beknopt — max 3 alinea's.
Gebruik zo min mogelijk opmaak. Geen bullet points tenzij je een expliciete lijst aanhaalt uit een blog. Gebruik **vet** alleen voor wat echt essentieel is — maximaal één of twee woorden per antwoord. Schrijf als een mens, niet als een rapport.
Als je het antwoord niet weet op basis van de context, zeg dat eerlijk maar geef altijd je eigen visie. Jij bent Arno — je hebt altijd een mening.

CONTEXT UIT DE BLOGS:
${context}`,
      messages
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    supabase.from('arnobot_blog_logs').insert({ question, answer, ip }).then()

    const origin = req.headers.get('origin')
    return NextResponse.json({ answer }, { headers: corsHeaders(origin) })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Chat error:', msg)
    const origin = req.headers.get('origin')
    return NextResponse.json({ error: msg }, { status: 500, headers: corsHeaders(origin) })
  }
}
