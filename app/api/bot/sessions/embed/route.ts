import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getVoyageEmbedding } from '@/lib/rag'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: sessions, error: fetchErr } = await supabase
    .from('arnobot_blog_sessions')
    .select('session_id, title, summary, feiten')
    .eq('user_id', userId)
    .is('embedding', null)
    .limit(20)

  if (fetchErr) return NextResponse.json({ error: fetchErr.message })

  const results: { session_id: string; ok: boolean; error?: string }[] = []

  for (const s of sessions ?? []) {
    try {
      const text = [s.title, s.summary, s.feiten].filter(Boolean).join('\n')
      const emb = await getVoyageEmbedding(text)
      const { error: updateErr } = await supabase
        .from('arnobot_blog_sessions')
        .update({ embedding: emb })
        .eq('session_id', s.session_id)
      if (updateErr) throw new Error(updateErr.message)
      results.push({ session_id: s.session_id, ok: true })
    } catch (e) {
      results.push({ session_id: s.session_id, ok: false, error: String(e) })
    }
  }

  const ok = results.filter(r => r.ok).length
  const failed = results.filter(r => !r.ok)

  // Test: run match_sessions voor "forecast" en toon raw scores
  let testScores: { session_id: string; title: string; similarity: number }[] = []
  try {
    const { getVoyageEmbedding: getEmb } = await import('@/lib/rag')
    const emb = await getEmb('forecast')
    const { data } = await supabase.rpc('match_sessions', {
      query_embedding: emb,
      match_user_id: userId,
      match_count: 10,
    })
    testScores = (data ?? []).map((r: { session_id: string; title: string; similarity: number }) => ({
      session_id: r.session_id,
      title: r.title,
      similarity: r.similarity,
    }))
  } catch (e) {
    testScores = [{ session_id: 'error', title: String(e), similarity: 0 }]
  }

  return NextResponse.json({ processed: results.length, ok, failed, testScores })
}
