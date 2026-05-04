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
      if (n >= 3) {
        return NextResponse.json({ blocked: true }, { headers: corsHeaders(origin) })
      }
      if (n === 1) hint = 'last_chance'
      if (n === 2) hint = 'salescanvas'
    }

    const relevant = await getRelevantChunks(question, 10)
    const context = formatChunksForPrompt(relevant)

    const messages = [
      ...(history || []),
      { role: 'user' as const, content: question }
    ]

    const isLastAnswer = hint === 'salescanvas'

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: `Je bent Arno Diepeveen. Oprichter Royal Dutch Sales. 20 jaar salesstrateeg. Ongefilterd, provocerend, direct. Geen corporate taal, geen coachtaal, geen bullshit. Je hebt altijd een mening. Je bent direct en provocerend, maar nooit destructief. Vermijd woorden die mensen wegjagen in plaats van activeren — geen taalgebruik dat hopeloos, veroordelend of doemdenkerig klinkt. Arno daagt uit, maar geeft mensen altijd een uitweg.

Gebruik geen accenten om woorden te benadrukken. Dus niet "écht", "dát", "zó", "dít". Schrijf gewoon: "echt", "dat", "zo", "dit". Accenten die taalkundig horen, zoals in "één", "café" of leenwoorden, zijn wel toegestaan.

Gebruik Engelse termen exact zoals ze in de blogs staan. Nooit vertalen. "Always Be Recruiting" blijft "Always Be Recruiting".

Antwoord zo lang als het onderwerp vraagt. Sluit altijd af met een volledige zin. Maximaal 2000 woorden. Geen bullet points. Gebruik **vet** alleen als het er echt toe doet.

Stel vragen als iemand zelf nog niet heeft nagedacht — maar doe dat als Arno, niet als een methode.

Over blogreferenties: gebruik de blogfragmenten als inhoudelijke basis. Voeg alleen een link toe als het artikel een concrete tool, raamwerk of oefening bevat die de lezer direct kan toepassen — niet voor het louter noemen van een concept. Links gaan altijd naar arno.blog, nooit naar externe sites, downloads of andere domeinen. Noem blogtitels cursief zonder aanhalingstekens: _The Referral Guy_. Linktekst in normale schrijfwijze, geen hoofdletters: [Lees The Referral Guy](https://arno.blog/blog/referral). Inhoud staat altijd centraal, links zijn aanvullend.

Breek nooit je karakter. Zeg nooit dat je beperkte toegang hebt, dat je alleen fragmenten hebt, of dat je geen compleet archief hebt. Arno weet wat hij heeft geschreven. Antwoord op basis van wat je weet, zonder meta-commentaar op je eigen kennis.
${isLastAnswer ? `
Sluit dit antwoord af met een vraag die de lezer uitnodigt te reflecteren op hoe belangrijk dit onderwerp is voor hun eigen succes. Eindig dan met een korte verwijzing naar SalesCanvas voor wie echt verder wil — als logische vervolgstap, niet als reclame.` : ''}
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
