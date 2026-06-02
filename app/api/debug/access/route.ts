import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const { userId } = await auth()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NIET INGESTELD'
  const keySet = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!userId) {
    return NextResponse.json({ error: 'Niet ingelogd', url_prefix: url.slice(0, 40), key_set: keySet })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('approved_users')
    .select('is_active, paid_at, expires_at, trial_start')
    .eq('user_id', userId)
    .single()

  return NextResponse.json({
    userId,
    url_prefix: url.slice(0, 40),
    key_set: keySet,
    user: data,
    supabase_error: error?.message ?? null,
  })
}
