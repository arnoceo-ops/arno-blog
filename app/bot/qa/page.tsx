import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import QAClient from './QAClient'

export default async function QAPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  return <QAClient />
}
