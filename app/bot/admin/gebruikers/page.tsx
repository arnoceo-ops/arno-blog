import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { clerkClient } from '@clerk/nextjs/server'
import SearchLinkedIn from './SearchLinkedIn'

const navLinkStyle = (active: boolean): React.CSSProperties => ({
  color: active ? '#EE7700' : '#888',
  textDecoration: 'none',
  fontSize: '15px',
  letterSpacing: '3px',
  fontWeight: 700,
  padding: '6px 20px',
  borderRadius: 4,
  background: active ? '#1a1a1a' : 'none',
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

      {/* NAV — gecentreerd */}
      <nav style={{ background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', height: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '5px', color: '#EE7700', fontWeight: 700 }}>ARNOBOT ADMIN</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <a href="/bot/admin" style={navLinkStyle(false)}>GESPREKKEN RDS</a>
          <a href="/bot/admin/widget" style={navLinkStyle(false)}>WIDGET</a>
          <a href="/bot/admin/gebruikers" style={navLinkStyle(true)}>GEBRUIKERS</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 40px' }}>

        <p style={{ color: '#EE7700', fontSize: '13px', letterSpacing: '5px', marginBottom: '8px' }}>ARNOBOT</p>
        <h1 style={{ fontSize: '56px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-1px' }}>Gebruikers</h1>
        <p style={{ color: '#555', fontSize: '14px', letterSpacing: '2px', marginBottom: '48px' }}>
          {enriched.length} gebruiker{enriched.length !== 1 ? 's' : ''}
        </p>

        {/* Tabel header */}
        <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 200px 160px 100px', gap: '0 32px', padding: '0 20px 12px', borderBottom: '1px solid #222' }}>
          <div />
          <span style={{ fontSize: '11px', letterSpacing: '3px', color: '#444' }}>NAAM / E-MAIL</span>
          <span style={{ fontSize: '11px', letterSpacing: '3px', color: '#444', textAlign: 'right' }}>STATUS</span>
          <span style={{ fontSize: '11px', letterSpacing: '3px', color: '#444', textAlign: 'right' }}>AANGEMELD</span>
          <span style={{ fontSize: '11px', letterSpacing: '3px', color: '#444', textAlign: 'right' }}>LINKEDIN</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
          {enriched.map((u) => {
            const name = u.clerkName || u.full_name || [u.voornaam, u.achternaam].filter(Boolean).join(' ') || '—'
            const status = trialStatus(u)
            const joinDate = new Date(u.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
            return (
              <div key={u.user_id} style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr 200px 160px 100px',
                gap: '0 32px',
                alignItems: 'center',
                background: '#0f0f0f',
                padding: '16px 20px',
                borderLeft: '3px solid #1a1a1a',
              }}>
                {/* Foto */}
                {u.imageUrl
                  ? <img src={u.imageUrl} alt={name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                  : <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#333' }}>?</div>
                }
                {/* Naam + email */}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '17px', marginBottom: '3px', color: '#f0ede6' }}>{name}</p>
                  <p style={{ fontSize: '13px', color: '#555', letterSpacing: '0.5px' }}>{u.email || '—'}</p>
                </div>
                {/* Status */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', letterSpacing: '2px', color: status.color, fontWeight: 700 }}>{status.label}</p>
                </div>
                {/* Datum */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', color: '#444', letterSpacing: '0.5px' }}>{joinDate}</p>
                </div>
                {/* LinkedIn */}
                <div style={{ textAlign: 'right' }}>
                  {u.linkedin
                    ? <a href={u.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', letterSpacing: '2px', color: '#EE7700', textDecoration: 'none', fontWeight: 700 }}>LI →</a>
                    : <SearchLinkedIn userId={u.user_id} name={name} hasLinkedin={false} />
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
