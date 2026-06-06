import { clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('arnobot_admin')?.value
  if (!token || token !== process.env.ARNOBOT_ADMIN_KEY) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { data: rows } = await supabase
    .from('approved_users')
    .select('user_id, voornaam, achternaam, linkedin')
    .not('user_id', 'like', 'pending_%')

  if (!rows?.length) return NextResponse.json({ updated: 0 })

  const clerk = await clerkClient()
  let updated = 0

  for (const row of rows) {
    try {
      const clerkUser = await clerk.users.getUser(row.user_id)
      const linkedinAccount = clerkUser.externalAccounts?.find(
        (a: { provider: string }) => a.provider.includes('linkedin')
      )
      const linkedinUrl = (linkedinAccount as { username?: string | null } | undefined)?.username
        ? `https://www.linkedin.com/in/${(linkedinAccount as { username: string }).username}`
        : null

      const patch: Record<string, string | null> = {}
      if (!row.voornaam && clerkUser.firstName) patch.voornaam = clerkUser.firstName
      if (!row.achternaam && clerkUser.lastName) patch.achternaam = clerkUser.lastName
      if (!row.linkedin && linkedinUrl) patch.linkedin = linkedinUrl

      if (Object.keys(patch).length > 0) {
        await supabase.from('approved_users').update(patch).eq('user_id', row.user_id)
        updated++
      }
    } catch {
      // gebruiker niet gevonden in Clerk, overslaan
    }
  }

  return NextResponse.json({ updated, total: rows.length })
}
