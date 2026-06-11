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

  // 1. Tekst-search in de echte gesprekken (exacte en gedeeltelijke matches)
  const { data: logs } = await supabase
    .from('arnobot_rds_logs')
    .select('session_id')
    .eq('user_id', userId)
    .or(`question.ilike.%${q}%,answer.ilike.%${q}%`)
    .limit(100)

  const textSessionIds = new Set((logs ?? []).map(l => l.session_id))

  // 2. Semantische search via embeddings (vindt verwante concepten zonder exact woordgebruik)
  const semanticSessionIds = new Set<string>()
  try {
    const embedding = await getVoyageEmbedding(q)
    const { data: vectorResults } = await supabase.rpc('match_sessions', {
      query_embedding: embedding,
      match_user_id: userId,
      match_count: 30,
    })
    const filtered = ((vectorResults ?? []) as { session_id: string; similarity: number }[])
      .filter(s => s.similarity >= 0.45)
    for (const r of filtered) semanticSessionIds.add(r.session_id)
  } catch {}

  const allIds = [...new Set([...textSessionIds, ...semanticSessionIds])]
  if (allIds.length === 0) return NextResponse.json({ sessions: [] })

  const { data: sessions } = await supabase
    .from('arnobot_blog_sessions')
    .select('session_id, title, summary, message_count, created_at, blog_suggestions')
    .eq('user_id', userId)
    .in('session_id', allIds)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ sessions: sessions ?? [] })
}
