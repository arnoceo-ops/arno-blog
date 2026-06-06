import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { clerkClient } from '@clerk/nextjs/server'

const navLinkStyle = (active: boolean): React.CSSProperties => ({
  color: active ? '#EE7700' : '#555',
  textDecoration: 'none',
  fontSize: '13px',
  letterSpacing: '3px',
  fontWeight: 700,
  paddingBottom: '4px',
  borderBottom: active ? '2px solid #EE7700' : '2px solid transparent',
})

function trialStatus(row: { paid_at?: string | null; expires_at?: string | null; trial_start?: string | null; is_active?: boolean }) {
  if (!row.is_active) return { label: 'INACTIEF', color: '#555' }
  if (row.paid_at) return { label: 'BETAALD', color: '#44cc88' }
  if (row.expires_at) {
    const exp = new Date(row.expires_at)
    const left = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (left <= 0) return { label: 'VERLOPEN', color: '#cc4444' }
    return { label: `TRIAL — ${left}d`, color: '#EE7700' }
  }
  if (row.trial_start) {
    const end = new Date(new Date(row.trial_start).getTime() + 30 * 24 * 60 * 60 * 1000)
    const left = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (left <= 0) return { label: 'TRIAL VERLOPEN', color: '#cc4444' }
    return { label: `TRIAL — ${left}d`, color: '#EE7700' }
  }
  return { label: 'ONBEKEND', color: '#555' }
}

export default async function GebruikersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('arnobot_admin')?.value
  if (!token || token !== process.env.ARNOBOT_ADMIN_KEY) redirect('/bot/admin/login')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: users } = await supabase
    .from('approved_users')
    .select('user_id, email, full_name, voornaam, achternaam, linkedin, trial_start, expires_at, paid_at, is_active, created_at')
    .order('created_at', { ascending: false })

  const clerk = await clerkClient()

  const enriched = await Promise.all(
    (users ?? []).map(async (u) => {
      let imageUrl: string | null = null
      let clerkName: string | null = null
      if (u.user_id && !u.user_id.startsWith('pending_')) {
        try {
          const cu = await clerk.users.getUser(u.user_id)
          imageUrl = cu.imageUrl ?? null
          const fn = cu.firstName || ''
          const ln = cu.lastName || ''
          if (fn || ln) clerkName = `${fn} ${ln}`.trim()
        } catch {}
      }
      return { ...u, imageUrl, clerkName }
    })
  )

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', color: '#f0ede6', fontFamily: 'sans-serif' }}>
      <nav style={{ background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <span style={{ fontFamily: 'monospace', fontSize: '14px', letterSpacing: '4px', color: '#EE7700', fontWeight: 700 }}>ARNOBOT ADMIN</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <a href="/bot/admin" style={{ ...navLinkStyle(false), padding: '6px 16px', borderBottom: 'none', borderRadius: 4 }}>GESPREKKEN RDS</a>
          <a href="/bot/admin/widget" style={{ ...navLinkStyle(false), padding: '6px 16px', borderBottom: 'none', borderRadius: 4 }}>WIDGET</a>
          <a href="/bot/admin/gebruikers" style={{ ...navLinkStyle(true), padding: '6px 16px', borderBottom: 'none', background: '#1a1a1a', borderRadius: 4 }}>GEBRUIKERS</a>
        </div>
      </nav>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>

        <p style={{ color: '#EE7700', fontSize: '16px', letterSpacing: '4px', marginBottom: '8px' }}>ARNOBOT</p>
        <h1 style={{ fontSize: '48px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-1px' }}>Gebruikers</h1>
        <p style={{ color: '#555', fontSize: '13px', letterSpacing: '2px', marginBottom: '40px' }}>
          {enriched.length} gebruiker{enriched.length !== 1 ? 's' : ''}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {enriched.map((u) => {
            const name = u.clerkName || u.full_name || [u.voornaam, u.achternaam].filter(Boolean).join(' ') || '—'
            const status = trialStatus(u)
            const joinDate = new Date(u.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
            return (
              <div key={u.user_id} style={{
                display: 'flex', alignItems: 'center', gap: '20px',
                background: '#0f0f0f', padding: '16px 20px',
                borderLeft: '3px solid #1a1a1a',
              }}>
                {u.imageUrl
                  ? <img src={u.imageUrl} alt={name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1a1a1a', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#333' }}>?</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px', color: '#f0ede6' }}>{name}</p>
                  <p style={{ fontSize: '12px', color: '#555', letterSpacing: '1px' }}>{u.email || '—'}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '11px', letterSpacing: '2px', color: status.color, fontWeight: 700, marginBottom: '4px' }}>{status.label}</p>
                  <p style={{ fontSize: '11px', color: '#333', letterSpacing: '1px' }}>{joinDate}</p>
                </div>
                {u.linkedin && (
                  <a href={u.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', letterSpacing: '2px', color: '#EE7700', textDecoration: 'none', flexShrink: 0 }}>
                    LI →
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
