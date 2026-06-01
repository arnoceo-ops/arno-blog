import { client } from '@/sanity/client'
import SparClient from './SparClient'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getSparPage() {
  return await client.fetch(`*[_type == "sparPage"][0]`, {}, { next: { revalidate: 0 } })
}

export default async function SparPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('arnobot_admin')?.value
  if (!token || token !== process.env.ARNOBOT_ADMIN_KEY) redirect('/bot/admin/login')

  const spar = await getSparPage()
  return (
    <SparClient
      taglineTitle={spar?.taglineTitle ?? '19 jaar blogs. 369.000 woorden.'}
      taglineSub={spar?.taglineSub ?? 'Stel je vraag over sales, strategie of mindset.\nGeen bullshit. Geen corporate taal.\nGewoon Arno — direct en ongefilterd.'}
      openers={spar?.openers ?? []}
    />
  )
}
