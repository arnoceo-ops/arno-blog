import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const ids: string[] = body.ids ?? []
  if (ids.length === 0) return NextResponse.json({ error: 'Geen ids' }, { status: 400 })

  await supabase
    .from('arnobot_analyses')
    .delete()
    .eq('user_id', userId)
    .in('id', ids)

  return NextResponse.json({ ok: true })
}
