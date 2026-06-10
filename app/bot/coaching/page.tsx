import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import CoachingClient from './CoachingClient'

export default async function CoachingPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from('approved_users')
    .select('tier')
    .eq('user_id', userId)
    .single()
  if (!data || data.tier === 'basis') redirect('/bot')

  return <CoachingClient userId={userId} />
}
