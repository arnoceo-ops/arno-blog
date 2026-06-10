import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ isAdmin: false })
  return NextResponse.json({ isAdmin: userId === process.env.ADMIN_USER_ID })
}
