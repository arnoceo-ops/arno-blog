import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (
    username !== process.env.ARNOBOT_ADMIN_USER ||
    password !== process.env.ARNOBOT_ADMIN_PASS
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = `${process.env.ARNOBOT_ADMIN_USER}:${process.env.ARNOBOT_ADMIN_PASS}`
  const res = NextResponse.json({ ok: true })
  res.cookies.set('arnobot_admin', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
