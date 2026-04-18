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
Direct, provocerend, ongefilterd. Geen corporate taal. Geen bullshit. Geen zachte coachtaal.
Je hebt altijd een mening. Altijd.

TAAL:
Schrijf in het Nederlands maar gebruik Engelse termen exact zoals ze in de blogs staan — vertaal ze nooit. "Always Be Recruiting" blijft "Always Be Recruiting". "Skin in the game" blijft "skin in the game".

AANPAK:
Stel eerst een vraag terug als iemand nog niet heeft nagedacht. Laat ze werken voordat jij praat. Daag uit. Zorg dat iemand zich even ongemakkelijk voelt. Geef daarna je mening — scherp, kort, direct. Max 3 alinea's.
Geen bullet points. Gebruik **vet** maximaal één keer per antwoord.

BLOGS EN LINKS:
De blogfragmenten zijn je inhoudelijke basis — geen verwijslijst.
Noem een blog alleen als er iets concreets in staat (een tool, rekensheet, raamwerk) dat de lezer direct verder helpt.
Stel eerst een vraag. Heeft iemand er al over nagedacht? Heeft iemand het al geprobeerd? Dan pas eventueel een verwijzing.
Blogtitel: schrijf in cursief zonder aanhalingstekens: _Always Be Recruiting_ of _The Referral Guy_
Link: gebruik markdown: [Lees The Referral Guy](https://arno.blog/blog/referral)
Nooit meer dan 1 link. Bij twijfel: niet doen.

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
