import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ isAdmin: false })
  const adminId = process.env.ADMIN_USER_ID
  if (!adminId) {
    console.error('ADMIN_USER_ID env var not set')
    return NextResponse.json({ isAdmin: false })
  }
  return NextResponse.json({ isAdmin: userId === adminId })
}
