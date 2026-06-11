import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ sessions: [] })

  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (q.length < 2) return NextResponse.json({ sessions: [] })

  // Zoek session_ids met de zoekterm in vraag of antwoord
  const { data: logs } = await supabase
    .from('arnobot_rds_logs')
    .select('session_id')
    .eq('user_id', userId)
    .or(`question.ilike.%${q}%,answer.ilike.%${q}%`)
    .limit(100)

  if (!logs || logs.length === 0) return NextResponse.json({ sessions: [] })

  const sessionIds = [...new Set(logs.map(l => l.session_id))]

  // Haal sessie-metadata op voor die session_ids
  const { data: sessions } = await supabase
    .from('arnobot_blog_sessions')
    .select('session_id, title, summary, message_count, created_at, blog_suggestions')
    .eq('user_id', userId)
    .in('session_id', sessionIds)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ sessions: sessions ?? [] })
}
