import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function searchChunks(chunks: string[], query: string, topN = 6): string[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  const scored = chunks.map((chunk) => {
    const lower = chunk.toLowerCase()
    let score = 0
    for (const word of queryWords) {
      const count = (lower.match(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
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

let cachedChunks: string[] | null = null

async function getChunks(): Promise<string[]> {
  if (cachedChunks) return cachedChunks

  // Fetch het tekstbestand via HTTP (werkt op Vercel)
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/chief_sales_updates.txt`, { cache: 'force-cache' })
  if (!res.ok) throw new Error(`Kon tekstbestand niet laden: ${res.status}`)
  const text = await res.text()

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

export async function POST(req: NextRequest) {
  try {
    const { question, history } = await req.json()

    const chunks = await getChunks()
    const relevant = searchChunks(chunks, question)

    const context = relevant.length > 0
      ? relevant.join('\n\n---\n\n')
      : 'Geen specifieke context gevonden.'

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
Verwijs af en toe naar specifieke inzichten uit de blogs. Houd het antwoord krachtig en beknopt — max 3 alinea's.
Als je het antwoord niet weet op basis van de context, zeg dat dan eerlijk maar geef wel je eigen visie.

CONTEXT UIT DE BLOGS:
${context}`,
      messages
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ answer })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Chat error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
