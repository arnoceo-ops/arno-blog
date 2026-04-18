import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: [text], model: 'voyage-3' }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Voyage API error: ${err}`)
  }
  const json = await res.json()
  return json.data[0].embedding
}

export type RagChunk = { content: string; source: string | null; url: string | null }

export async function getRelevantChunks(query: string, topN = 6): Promise<RagChunk[]> {
  const queryEmbedding = await getEmbedding(query)

  const { data, error } = await supabase.rpc('match_blog_chunks', {
    query_embedding: queryEmbedding,
    match_count: topN,
  })

  if (error) throw new Error(`Supabase RAG error: ${error.message}`)

  return (data as { content: string; source: string | null; url: string | null; similarity: number }[]).map(row => ({
    content: row.content,
    source: row.source ?? null,
    url: row.url ?? null,
  }))
}

export function formatChunksForPrompt(chunks: RagChunk[]): string {
  if (chunks.length === 0) return 'Geen specifieke context gevonden.'
  return chunks
    .map(c => {
      const label = c.source
        ? c.url
          ? `[Bron: ${c.source} | URL: ${c.url}]`
          : `[Bron: ${c.source}]`
        : null
      return label ? `${label}\n${c.content}` : c.content
    })
    .join('\n\n---\n\n')
}
