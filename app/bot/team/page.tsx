import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import TeamClient from './TeamClient'

export default async function TeamPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  return <TeamClient />
}
