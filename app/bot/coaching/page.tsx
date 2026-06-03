import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import CoachingClient from './CoachingClient'

export default async function CoachingPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return <CoachingClient userId={userId} />
}
