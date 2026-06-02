import { client } from '@/sanity/client'
import SparClient from './SparClient'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

async function getSparPage() {
  return await client.fetch(`*[_type == "sparPage"][0]`, {}, { next: { revalidate: 0 } })
}

export default async function BotPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const spar = await getSparPage()
  return (
    <SparClient
      userId={userId}
      taglineTitle={spar?.taglineTitle ?? '19 jaar blogs. 369.000 woorden.'}
      taglineSub={spar?.taglineSub ?? 'Stel je vraag over sales, strategie of mindset.\nGeen bullshit. Geen corporate taal.\nGewoon Arno — direct en ongefilterd.'}
      openers={spar?.openers ?? []}
    />
  )
}
