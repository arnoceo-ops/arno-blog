import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { join } from 'path'

const client = new Anthropic()

// ── RAG: kennisbank ───────────────────────────────────────────────────
let cachedChunks: string[] | null = null

function getChunks(): string[] {
  if (cachedChunks) return cachedChunks
  const filePath = join(process.cwd(), 'data', 'chief_sales_updates.txt')
  const text = readFileSync(filePath, 'utf-8')
  const words = text.split(/\s+/)
  const chunks: string[] = []
  const chunkSize = 400
  const overlap = 50
  let i = 0
  while (i < words.length) {
    chunks.push(words.slice(i, i + chunkSize).join(' '))
    i += chunkSize - overlap
  }
  cachedChunks = chunks
  return chunks
}

function searchChunks(chunks: string[], query: string, topN = 4): string[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  const scored = chunks.map(chunk => {
    const lower = chunk.toLowerCase()
    let score = 0
    for (const word of queryWords) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const count = (lower.match(new RegExp(escaped, 'g')) || []).length
      score += count
    }
    return { chunk, score }
  })
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .filter(s => s.score > 0)
    .map(s => s.chunk)
}
// ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { label, sub, answer, mode, questionId } = await req.json()

    // ── SCORING MODE ─────────────────────────────────────────────────
    if (mode === 'score') {
      if (!answer?.trim()) {
        return NextResponse.json({ score: 1, reden: 'Geen antwoord ingevuld.' })
      }

      const scoreMessage = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `Je bent een sales strategie beoordelaar.
Beoordeel het volgende antwoord op vraag "${questionId}" op een schaal van 1 tot 5.

Antwoord: "${answer}"

Geef ALLEEN een JSON object terug, geen uitleg, geen markdown:
{"score": 3, "reden": "Kort maar concreet. Mist meetbare KPI's."}

Schaal:
1 = Leeg of onbruikbaar
2 = Vaag, geen richting
3 = Basis aanwezig, niet scherp
4 = Concreet en realistisch
5 = Scherp, meetbaar, actiegericht`,
          },
        ],
      })

      const raw = scoreMessage.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('')
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return NextResponse.json(parsed)
    }
    // ── EINDE SCORING MODE ────────────────────────────────────────────

    if (!answer?.trim()) {
      return NextResponse.json({ feedback: 'Vul dit veld in voor ArnoBot feedback.' })
    }

    // RAG: zoek relevante chunks op basis van vraag + antwoord
    const chunks = getChunks()
    const query = `${label} ${sub} ${answer}`
    const relevant = searchChunks(chunks, query)
    const context = relevant.length > 0
      ? relevant.join('\n\n---\n\n')
      : ''

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 400,
      system: `Je bent ArnoBot — de ongefiltreerde, provocerende AI van Royal Dutch Sales. Je bent gebaseerd op Arno Diepeveen: sales strateeg, auteur, en iemand die al 20 jaar middelmatigheid in salesorganisaties benoemt zonder er omheen te draaien.

Jouw mantra: Provocerend. Suggestief. Ongefilterd. Priceless.

Jouw beoordelingscriteria zijn DIEPGANG, CONCRETIE en CREATIVITEIT/UNICITEIT. Ontbreekt een van deze drie? Dan is het antwoord onvoldoende.

HOE JE REAGEERT:

Bij een ZWAK antwoord (vaag, oppervlakkig, clichématig, of toont dat iemand het concept niet begrijpt):
- Wees prikkelend en direct. Zinnen als "Ga er een nachtje over slapen." of "Is dit écht het beste wat je hebt?" zijn acceptabel.
- Als iemand een concept duidelijk niet begrijpt (bijv. OMTM, zandbak, xfactor), leg het dan kort en scherp uit in Arno's stijl — niet als Wikipedia maar als iemand die je wakker schudt.
- Eindig met een concrete uitdaging of vraag die dwingt tot nadenken.

Bij een MATIG antwoord (richting is er, maar mist scherpte of bewijs):
- Geen complimenten. Benoem in één zin wat er mist zonder er omheen te draaien.
- Geef concrete aanwijzingen: welk cijfer ontbreekt? Welke keuze wordt vermeden? Wat is de volgende laag?
- Eindig met een vraag die geen ontwijkend antwoord toelaat.

Bij een STERK antwoord (diepgang, concrete cijfers of keuzes, eigen en uniek):
- Geef een echte pat on the shoulder — maar geen overdreven lof.
- Benoem specifiek waarom het sterk is.
- Geef eventueel één suggestie voor nog meer scherpte, maar alleen als die er echt is.
- Zeg expliciet dat dit antwoord voldoende is en dat ze verder kunnen.

TOON:
- Direct, eerlijk, soms sarcastisch maar nooit persoonlijk negatief
- Geen corporate taal, geen zachte coachtaal
- Max 4 zinnen
- Altijd in het Nederlands
- Gebruik de context uit Arno's blogs waar relevant

${context ? `CONTEXT UIT DE BLOGS VAN ARNO:\n${context}` : ''}`,

      messages: [
        {
          role: 'user',
          content: `Canvas sectie: ${label}${sub ? ` — ${sub}` : ''}

Antwoord van de ondernemer:
"${answer}"

Beoordeel dit antwoord op diepgang, concretie en creativiteit/uniciteit. Is het concept begrepen? Is het antwoord voldoende of moet er meer komen?`,
        },
      ],
    })


    const feedback = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('')

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('ArnoBot error:', error)
    return NextResponse.json(
      { error: 'ArnoBot is tijdelijk niet beschikbaar.' },
      { status: 500 }
    )
  }
}