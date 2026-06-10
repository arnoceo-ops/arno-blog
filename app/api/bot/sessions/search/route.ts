import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getVoyageEmbedding } from '@/lib/rag'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ sessions: [] })

  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (q.length < 2) return NextResponse.json({ sessions: [] })

  const embedding = await getVoyageEmbedding(q)

  const { data, error } = await supabase.rpc('match_sessions', {
    query_embedding: embedding,
    match_user_id: userId,
    match_count: 30,
  })

  if (error) {
    console.error('[sessions/search]', error.message)
    return NextResponse.json({ sessions: [] })
  }

  const results = (data ?? []) as { similarity: number; title?: string }[]
  const filtered = results.filter(s => s.similarity >= 0.65).slice(0, 5)
  return NextResponse.json({ sessions: filtered })
}
