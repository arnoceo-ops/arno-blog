import { client } from '@/sanity/client'
import SparClient from './SparClient'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const serviceDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getSparPage() {
  return await client.fetch(`*[_type == "sparPage"][0]`, {}, { next: { revalidate: 0 } })
}

export default async function BotPage({ searchParams }: { searchParams: Promise<{ resume?: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: profileRow } = await serviceDb
    .from('arnobot_blog_profiles')
    .select('profiel')
    .eq('user_id', userId)
    .single()

  if (!profileRow) redirect('/bot/profiel')

  const spar = await getSparPage()
  const { resume } = await searchParams
  return (
    <SparClient
      userId={userId}
      profiel={profileRow.profiel}
      taglineTitle={spar?.taglineTitle ?? '19 jaar blogs. 369.000 woorden.'}
      taglineSub={spar?.taglineSub ?? 'Stel je vraag over sales, strategie of mindset.\nGeen bullshit. Geen corporate taal.\nGewoon Arno — direct en ongefilterd.'}
      openers={spar?.openers ?? []}
      resumeSessionId={resume}
    />
  )
}
