import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ sessions: [] })

  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (q.length < 2) return NextResponse.json({ sessions: [] })

  // Verbreed de zoekopdracht naar verwante termen via Claude
  let terms = [q]
  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Geef maximaal 6 verwante zoektermen voor "${q}" in de context van sales en zakelijke gesprekken. Zowel Nederlands als Engels. Retourneer alleen een JSON-array van strings, niets anders.`,
      }],
    })
    const text = res.content[0].type === 'text' ? res.content[0].text.trim() : '[]'
    const parsed = JSON.parse(text.match(/\[.*\]/s)?.[0] ?? '[]')
    if (Array.isArray(parsed)) terms = [...new Set([q, ...parsed])]
  } catch {}

  // Zoek voor elke term in de gespreksteksten
  const results = await Promise.all(
    terms.map(term =>
      supabase.rpc('search_sessions_text', {
        search_query: term,
        search_user_id: userId,
        match_count: 20,
      })
    )
  )

  const sessionIds = [...new Set(
    results.flatMap(r => ((r.data ?? []) as { session_id: string }[]).map(l => l.session_id))
  )]

  if (sessionIds.length === 0) return NextResponse.json({ sessions: [] })

  const { data: sessions } = await supabase
    .from('arnobot_blog_sessions')
    .select('session_id, title, summary, message_count, created_at, blog_suggestions')
    .eq('user_id', userId)
    .in('session_id', sessionIds)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ sessions: sessions ?? [] })
}
