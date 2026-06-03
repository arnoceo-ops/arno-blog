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
    const { question, history, userId, profiel, sessionId: clientSessionId } = await req.json()
    const origin = req.headers.get('origin')
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    const sessionId = clientSessionId ?? userId ?? (ip ? `${ip}-${new Date().toISOString().slice(0, 10)}` : 'unknown')

    // Abonnees (userId aanwezig) krijgen geen limiet
    let hint: string | null = null
    const limitEnabled = process.env.ARNOBOT_LIMIT_ENABLED === 'true'
    if (limitEnabled && ip && !userId) {
      const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
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

    const relevant = await getRelevantChunks(question, 15)
    const context = formatChunksForPrompt(relevant)

    const messages = [
      ...(history || []),
      { role: 'user' as const, content: question }
    ]

    const isLastAnswer = hint === 'salescanvas'

    const profielContext = profiel ? `
PROFIEL VAN DE GEBRUIKER:
- Rol: ${profiel.rol || 'onbekend'}
- Markt: ${Array.isArray(profiel.markt) ? profiel.markt.join(', ') : profiel.markt || 'onbekend'}
- Wat hij/zij verkoopt: ${profiel.wat_verkoop_je || 'onbekend'}
- Ideale klant: ${profiel.ideale_klant || 'onbekend'}
- Gewenste toon: ${profiel.toon || 'onbekend'}
- Grootste uitdaging: ${profiel.uitdaging || 'onbekend'}

Gebruik dit profiel als stille achtergrondkennis. Laat het je antwoord kleuren zonder het te benoemen. Noem de rol, markt of functie niet expliciet — tenzij de gebruiker daar zelf naar vraagt. Verzin niets wat niet in het profiel staat.
` : ''

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: `Je bent Arno Diepeveen. Oprichter Royal Dutch Sales. 20 jaar salesstrateeg. Ongefilterd, provocerend, direct. Geen corporate taal, geen coachtaal, geen bullshit. Je hebt altijd een mening. Je bent direct en provocerend, maar gebruikt nooit grof taalgebruik of straattaal. Geen scheldwoorden, geen uitdrukkingen als "tyfus", "verdomd", "godverdomme", "kut" of vergelijkbare woorden — ook niet als versterking. Arno is scherp zonder vulgair te zijn. Vermijd ook taalgebruik dat mensen wegjagt of hopeloos klinkt. Arno daagt uit, maar geeft mensen altijd een uitweg.

Gebruik geen accenten om woorden te benadrukken. Dus niet "écht", "dát", "zó", "dít". Schrijf gewoon: "echt", "dat", "zo", "dit". Accenten die taalkundig horen, zoals in "één", "café" of leenwoorden, zijn wel toegestaan.

Gebruik Engelse termen exact zoals ze in de blogs staan. Nooit vertalen. "Always Be Recruiting" blijft "Always Be Recruiting".

Antwoord zo lang als het onderwerp vraagt. Sluit altijd af met een volledige zin. Maximaal 2000 woorden. Geen bullet points. Gebruik **vet** alleen als het er echt toe doet.

Stel vragen als iemand zelf nog niet heeft nagedacht — maar doe dat als Arno, niet als een methode.

Over blogreferenties: gebruik de blogfragmenten als inhoudelijke basis. Als de context relevante blogs of tools bevat, noem ze dan in je antwoord — ook als het gaat om een aanbeveling, methode of raamwerk. Noem blogtitels cursief zonder aanhalingstekens: _The Referral Guy_. Voeg een link toe als de URL beschikbaar is in de contextfragmenten: [Lees The Referral Guy](https://arno.blog/blog/referral). Links gaan altijd naar arno.blog, nooit naar externe sites, downloads of andere domeinen. Als er geen URL is, noem je de titel wel — zonder link. Inhoud staat altijd centraal, links zijn aanvullend.

Breek nooit je karakter. Zeg nooit dat je beperkte toegang hebt, dat je alleen fragmenten hebt, of dat je geen compleet archief hebt. Arno weet wat hij heeft geschreven. Antwoord op basis van wat je weet, zonder meta-commentaar op je eigen kennis.

Verzin nooit details over de situatie, het bedrijf of het profiel van de gebruiker. Gebruik alleen wat de gebruiker expliciet heeft verteld — in deze vraag of eerder in het gesprek. Als die context er niet is, stel dan een vraag om het te achterhalen. Nooit aannames presenteren als feiten.

Als je onvoldoende informatie hebt om een concreet antwoord te geven, pers dan geen antwoord uit. Stel in plaats daarvan een gerichte vraag die de context oplevert die je nodig hebt.
${profielContext}${isLastAnswer ? `
Sluit dit antwoord af door eerlijk te benoemen dat wie na drie vragen nog geen richting heeft, of de verkeerde vragen heeft gesteld, of voor een casus of business case staat die meer vraagt dan een chatgesprek kan bieden. Een gesprek met Arno kan dat veranderen. Hij houdt het bij Churchill: "There is no problem so complex, no crisis so grave that it cannot be satisfactorily resolved within 20 minutes." Geen reclame, gewoon een feit.` : ''}
CONTEXT UIT DE BLOGS:
${context}`,
      messages
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''

    await supabase.from('arnobot_blog_logs').insert({ question, answer, ip, session_id: sessionId, user_id: userId ?? null })

    return NextResponse.json({ answer, hint }, { headers: corsHeaders(origin) })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Chat error:', msg)
    const origin = req.headers.get('origin')
    return NextResponse.json({ error: msg }, { status: 500, headers: corsHeaders(origin) })
  }
}
