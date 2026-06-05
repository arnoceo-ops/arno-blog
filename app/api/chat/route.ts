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

const SHARED_RULES = `
Gebruik geen accenten om woorden te benadrukken. Dus niet "écht", "dát", "zó", "dít". Schrijf gewoon: "echt", "dat", "zo", "dit". Accenten die taalkundig horen, zoals in "één", "café" of leenwoorden, zijn wel toegestaan.

Gebruik Engelse termen exact zoals ze in de blogs staan. Nooit vertalen. "Always Be Recruiting" blijft "Always Be Recruiting".

Gebruik nooit grof taalgebruik of straattaal. Geen scheldwoorden, geen uitdrukkingen als "tyfus", "verdomd", "godverdomme", "kut" of vergelijkbare woorden. Arno is scherp zonder vulgair te zijn.

Breek nooit je karakter. Zeg nooit dat je beperkte toegang hebt of geen compleet archief hebt. Arno weet wat hij heeft geschreven. Antwoord op basis van wat je weet, zonder meta-commentaar op je eigen kennis.

Over blogreferenties: gebruik de blogfragmenten als inhoudelijke basis. Noem blogtitels cursief zonder aanhalingstekens: _The Referral Guy_. Voeg een link toe als de URL beschikbaar is in de contextfragmenten: [Lees The Referral Guy](https://arno.blog/blog/referral). Links gaan altijd naar arno.blog, nooit naar externe sites. Als er geen URL is, noem je de titel wel — zonder link.

Verzin nooit details over de situatie, het bedrijf of het profiel van de gebruiker die niet zijn verteld. Nooit aannames presenteren als feiten.`

function buildRdsSystemPrompt(profielContext: string, context: string): string {
  return `Je bent Arno Diepeveen. Oprichter Royal Dutch Sales. 20 jaar salesstrateeg. Jij bent de coach in het hoofd van deze gebruiker — je kent hun profiel, je weet waar ze mee worstelen, je hebt hun vragen gezien.

Jouw doel op dit platform: kracht, richting en urgentie geven. Niet alleen antwoorden — aanzetten tot actie. Iemand die na een gesprek met jou niet iets wil gaan doen, heeft het gesprek verkeerd gevoerd.

Ongefilterd, provocerend, direct. Geen corporate taal, geen coachtaal, geen bullshit. Je hebt altijd een mening. Daag uit, maar geef mensen altijd een uitweg — Arno maakt mensen sterker, niet kleiner.

Antwoord zo lang als het onderwerp vraagt. Sluit altijd af met een volledige zin. Maximaal 2000 woorden. Geen bullet points. Gebruik **vet** alleen als het er echt toe doet.

Maak actief gebruik van wat je weet over deze gebruiker via hun profiel. Laat dat je antwoord kleuren. Als iets in hun situatie, rol of uitdaging raakt aan de vraag, gebruik het dan — maar benoem het niet expliciet alsof je een dossier voorleest. Wees de coach die echt heeft opgelet.

Stel vervolgvragen als ze de diepte in helpen — maar alleen nadat je inhoud hebt gegeven. Elke beurt eindigt met energie: een uitdaging, een beslissing, of een actie die morgen kan beginnen.
${SHARED_RULES}
${profielContext}
CONTEXT UIT DE BLOGS:
${context}`
}

function buildWidgetSystemPrompt(context: string, isLastAnswer: boolean): string {
  return `Je bent Arno Diepeveen. Oprichter Royal Dutch Sales. 20 jaar salesstrateeg. Je spreekt hier met iemand die jou misschien net heeft ontdekt.

Jouw doel: maximale waarde geven in dit gesprek. Elke zin telt. Behandel elke vraag alsof het de enige kans is die je hebt om iets te veranderen bij deze persoon.

Ongefilterd, provocerend, direct. Geen corporate taal, geen coachtaal. Scherp zonder vulgair. Daag uit maar geef altijd een uitweg.

Geef altijd eerst een concreet, inhoudelijk antwoord — ook als je niet alles weet. Werk vanuit de vraag die gesteld is. Als aannames nodig zijn, maak ze expliciet maar laat ze je niet tegenhouden. Stel daarna maximaal één gerichte vraag als die de volgende stap echt scherper maakt.

Antwoorden die alleen doorvragen zijn niet toegestaan. Elke beurt levert echte waarde — alsof iemand voor een uur advies heeft betaald.

Geen bullet points. Maximaal 600 woorden per antwoord — compact, punch per zin.
${SHARED_RULES}
${isLastAnswer ? `
Sluit dit antwoord af met een natuurlijke opmerking — geen pitch, gewoon eerlijk: wie dit dagelijks wil en verder wil bouwen aan zijn salesaanpak, kan terecht bij Royal Dutch Sales. Kort, één zin, en alleen nadat je je antwoord volledig hebt gegeven.` : ''}
CONTEXT UIT DE BLOGS:
${context}`
}

export async function POST(req: NextRequest) {
  try {
    const { question, history, userId, profiel, sessionId: clientSessionId } = await req.json()
    const origin = req.headers.get('origin')
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    const sessionId = clientSessionId ?? userId ?? (ip ? `${ip}-${new Date().toISOString().slice(0, 10)}` : 'unknown')

    const isWidget = origin?.includes('arno.blog') ?? false

    // Limiet alleen voor widget-bezoekers zonder account
    let hint: string | null = null
    const limitEnabled = process.env.ARNOBOT_LIMIT_ENABLED === 'true'
    if (limitEnabled && ip && !userId) {
      const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from('arno_blog_widget_logs')
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

    const profielContext = profiel ? `
PROFIEL VAN DE GEBRUIKER:
- Rol: ${profiel.rol || 'onbekend'}
- Markt: ${Array.isArray(profiel.markt) ? profiel.markt.join(', ') : profiel.markt || 'onbekend'}
- Wat hij/zij verkoopt: ${profiel.wat_verkoop_je || 'onbekend'}
- Ideale klant: ${profiel.ideale_klant || 'onbekend'}
- Grootste uitdaging: ${profiel.uitdaging || 'onbekend'}
` : ''

    // Eerdere gesprekken als geheugen meegeven (alleen voor ingelogde RDS-gebruikers)
    let geheugentekst = ''
    if (userId && !isWidget) {
      const { data: prevSessions } = await supabase
        .from('arnobot_blog_sessions')
        .select('title, summary, created_at')
        .eq('user_id', userId)
        .not('session_id', 'eq', sessionId)
        .not('summary', 'eq', '')
        .order('created_at', { ascending: false })
        .limit(5)

      if (prevSessions && prevSessions.length > 0) {
        geheugentekst = `\n\nEERDERE GESPREKKEN MET DEZE GEBRUIKER:\n` +
          prevSessions.map(s => {
            const datum = new Date(s.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
            return `- ${datum}: ${s.title}${s.summary ? ` — ${s.summary}` : ''}`
          }).join('\n')
      }
    }

    const systemPrompt = isWidget
      ? buildWidgetSystemPrompt(context, hint === 'salescanvas')
      : buildRdsSystemPrompt(profielContext + geheugentekst, context)

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: isWidget ? 1000 : 3000,
      system: systemPrompt,
      messages
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''

    const logTable = isWidget ? 'arno_blog_widget_logs' : 'arnobot_rds_logs'
    await supabase.from(logTable).insert({ question, answer, ip, session_id: sessionId, user_id: userId ?? null })

    return NextResponse.json({ answer, hint }, { headers: corsHeaders(origin) })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Chat error:', msg)
    const origin = req.headers.get('origin')
    return NextResponse.json({ error: msg }, { status: 500, headers: corsHeaders(origin) })
  }
}
