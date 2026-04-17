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
import { readFileSync } from 'fs'
import { join } from 'path'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function searchChunks(chunks: string[], query: string, topN = 6): string[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  const scored = chunks.map((chunk) => {
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

export async function POST(req: NextRequest) {
  try {
    const { question, history } = await req.json()

    const chunks = getChunks()
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
Gebruik zo min mogelijk opmaak. Geen bullet points. Gebruik **vet** alleen voor wat echt essentieel is — maximaal één of twee woorden per antwoord. Gebruik *cursief* spaarzaam. Schrijf als een mens, niet als een rapport.
Als je het antwoord niet weet op basis van de context, zeg dat dan eerlijk maar geef wel je eigen visie.

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
