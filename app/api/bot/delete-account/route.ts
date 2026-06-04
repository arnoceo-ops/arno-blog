import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  try {
    await Promise.all([
      supabaseAdmin.from('arnobot_blog_profiles').delete().eq('user_id', userId),
      supabaseAdmin.from('arnobot_rds_logs').delete().eq('user_id', userId),
      supabaseAdmin.from('approved_users').delete().eq('user_id', userId),
    ])

    const clerk = await clerkClient()
    await clerk.users.deleteUser(userId)

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Fout' }, { status: 500 })
  }
}
