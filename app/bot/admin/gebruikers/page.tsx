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

function SortHeader({ label, field, sort, dir }: { label: string; field: string; sort: string; dir: string }) {
  const isActive = sort === field
  const nextDir = isActive && dir === 'desc' ? 'asc' : 'desc'
  const arrow = isActive ? (dir === 'desc' ? ' ↓' : ' ↑') : ''
  return (
    <a
      href={`?sort=${field}&dir=${nextDir}`}
      style={{ fontSize: '11px', letterSpacing: '3px', color: isActive ? '#EE7700' : '#444', textDecoration: 'none', textAlign: 'right', display: 'block', cursor: 'pointer' }}
    >
      {label}{arrow}
    </a>
  )
}

export default async function GebruikersPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('arnobot_admin')?.value
  if (!token || token !== process.env.ARNOBOT_ADMIN_KEY) redirect('/bot/admin/login')

  const params = await searchParams
  const sort = params.sort || 'aangemeld'
  const dir = params.dir || 'desc'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [usersRes, sessionsRes, coachingRes] = await Promise.all([
    supabase
      .from('approved_users')
      .select('user_id, email, full_name, voornaam, achternaam, linkedin, trial_start, expires_at, paid_at, is_active, created_at'),
    supabase
      .from('arnobot_blog_sessions')
      .select('user_id, message_count, created_at'),
    supabase
      .from('arnobot_coaching')
      .select('user_id, updated_at'),
  ])

  const sessions = sessionsRes.data ?? []
  const coachingRows = coachingRes.data ?? []

  // Aggregate per user
  const sessionMap: Record<string, { count: number; questions: number; lastSession: string | null; recentCount: number }> = {}
  for (const s of sessions) {
    if (!sessionMap[s.user_id]) sessionMap[s.user_id] = { count: 0, questions: 0, lastSession: null, recentCount: 0 }
    const m = sessionMap[s.user_id]
    m.count++
    m.questions += s.message_count || 0
    if (!m.lastSession || s.created_at > m.lastSession) m.lastSession = s.created_at
    if (s.created_at >= sevenDaysAgo) m.recentCount++
  }

  const coachingMap: Record<string, number> = {}
  for (const c of coachingRows) {
    coachingMap[c.user_id] = (coachingMap[c.user_id] || 0) + 1
  }

  const clerk = await clerkClient()

  const enriched = await Promise.all(
    (usersRes.data ?? []).map(async (u) => {
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
      const activity = sessionMap[u.user_id] ?? { count: 0, questions: 0, lastSession: null, recentCount: 0 }
      return { ...u, imageUrl, clerkName, ...activity, coachingCount: coachingMap[u.user_id] ?? 0 }
    })
  )

  // Sort
  const sorted = [...enriched].sort((a, b) => {
    let av: number | string = 0
    let bv: number | string = 0
    if (sort === 'naam') { av = (a.clerkName || a.full_name || '').toLowerCase(); bv = (b.clerkName || b.full_name || '').toLowerCase() }
    if (sort === 'aangemeld') { av = a.created_at; bv = b.created_at }
    if (sort === 'gesprekken') { av = a.count; bv = b.count }
    if (sort === 'vragen') { av = a.questions; bv = b.questions }
    if (sort === 'laatste') { av = a.lastSession || ''; bv = b.lastSession || '' }
    if (sort === 'coaching') { av = a.coachingCount; bv = b.coachingCount }
    if (sort === 'actief') { av = a.recentCount; bv = b.recentCount }
    if (av < bv) return dir === 'asc' ? -1 : 1
    if (av > bv) return dir === 'asc' ? 1 : -1
    return 0
  })

  const cols = '56px 1fr 140px 80px 80px 100px 70px 80px 80px'

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', color: '#f0ede6', fontFamily: 'sans-serif' }}>

      <nav style={{ background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', height: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '5px', color: '#EE7700', fontWeight: 700 }}>ARNOBOT ADMIN</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <a href="/bot/admin" style={navLinkStyle(false)}>GESPREKKEN RDS</a>
          <a href="/bot/admin/widget" style={navLinkStyle(false)}>WIDGET</a>
          <a href="/bot/admin/gebruikers" style={navLinkStyle(true)}>GEBRUIKERS</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 40px' }}>

        <p style={{ color: '#EE7700', fontSize: '13px', letterSpacing: '5px', marginBottom: '8px' }}>ARNOBOT</p>
        <h1 style={{ fontSize: '56px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-1px' }}>Gebruikers</h1>
        <p style={{ color: '#555', fontSize: '14px', letterSpacing: '2px', marginBottom: '48px' }}>
          {sorted.length} gebruiker{sorted.length !== 1 ? 's' : ''}
        </p>

        {/* Tabel header */}
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '0 24px', padding: '0 20px 12px', borderBottom: '1px solid #222', alignItems: 'end' }}>
          <div />
          <a href={`?sort=naam&dir=${sort === 'naam' && dir === 'desc' ? 'asc' : 'desc'}`} style={{ fontSize: '11px', letterSpacing: '3px', color: sort === 'naam' ? '#EE7700' : '#444', textDecoration: 'none' }}>
            NAAM{sort === 'naam' ? (dir === 'desc' ? ' ↓' : ' ↑') : ''}
          </a>
          <SortHeader label="STATUS" field="aangemeld" sort={sort} dir={dir} />
          <SortHeader label="GESPREKKEN" field="gesprekken" sort={sort} dir={dir} />
          <SortHeader label="VRAGEN" field="vragen" sort={sort} dir={dir} />
          <SortHeader label="LAATSTE GESPREK" field="laatste" sort={sort} dir={dir} />
          <SortHeader label="COACHING" field="coaching" sort={sort} dir={dir} />
          <SortHeader label="7 DAGEN" field="actief" sort={sort} dir={dir} />
          <span style={{ fontSize: '11px', letterSpacing: '3px', color: '#444', textAlign: 'right' }}>LINKEDIN</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
          {sorted.map((u) => {
            const name = u.clerkName || u.full_name || [u.voornaam, u.achternaam].filter(Boolean).join(' ') || '—'
            const status = trialStatus(u)
            const lastSessionDate = u.lastSession
              ? new Date(u.lastSession).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
              : '—'
            const actief7d = u.recentCount > 0
            return (
              <div key={u.user_id} style={{
                display: 'grid',
                gridTemplateColumns: cols,
                gap: '0 24px',
                alignItems: 'center',
                background: '#0f0f0f',
                padding: '14px 20px',
                borderLeft: `3px solid ${actief7d ? '#44cc88' : '#1a1a1a'}`,
              }}>
                {/* Foto */}
                {u.imageUrl
                  ? <img src={u.imageUrl} alt={name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                  : <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#333' }}>?</div>
                }
                {/* Naam + email */}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '2px', color: '#f0ede6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
                  <p style={{ fontSize: '12px', color: '#555' }}>{u.email || '—'}</p>
                </div>
                {/* Status */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', letterSpacing: '2px', color: status.color, fontWeight: 700 }}>{status.label}</p>
                </div>
                {/* Gesprekken */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: u.count > 0 ? '#f0ede6' : '#333' }}>{u.count}</p>
                </div>
                {/* Vragen */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: u.questions > 0 ? '#f0ede6' : '#333' }}>{u.questions}</p>
                </div>
                {/* Laatste gesprek */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', color: '#888' }}>{lastSessionDate}</p>
                </div>
                {/* Coaching */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: u.coachingCount > 0 ? '#44cc88' : '#333' }}>{u.coachingCount || '—'}</p>
                </div>
                {/* Actief 7d */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px' }}>{actief7d ? '🟢' : '🔴'}</span>
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
