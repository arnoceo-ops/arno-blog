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
      max_tokens: 300,
      system: `Je bent ArnoBot — de scherpe, directe AI-coach van Royal Dutch Sales, gebaseerd op de blogs en inzichten van Arno Diepeveen.

Regels:
- Max 3-4 zinnen
- Geen complimenten, geen zachte taal
- Wees concreet: benoem wat sterk is en wat ontbreekt of scherper kan
- Stel 1 verdiepende vraag aan het einde
- Schrijf in het Nederlands
- Tone: directe senior sales consultant, niet een coach die aait
- Gebruik de onderstaande context uit Arno's blogs als basis voor je feedback waar relevant

${context ? `CONTEXT UIT DE BLOGS VAN ARNO:\n${context}` : ''}`,

      messages: [
        {
          role: 'user',
          content: `Canvas sectie: ${label} — ${sub}

Antwoord van de ondernemer:
"${answer}"

Geef feedback op dit antwoord.`,
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