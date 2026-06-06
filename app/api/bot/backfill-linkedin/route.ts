import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ADMIN_ID = 'user_3Anf3P2XruhPw1Zkko7sxqrfUvp'

export async function POST() {
  const { userId } = await auth()
  if (userId !== ADMIN_ID) {
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
