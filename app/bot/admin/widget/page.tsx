import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import DownloadPdfButton from '../DownloadPdfButton'

type LogRow = {
  id: string
  created_at: string
  question: string
  answer: string
  ip: string
  session_id: string
}

const navLinkStyle = (active: boolean): React.CSSProperties => ({
  color: active ? '#EE7700' : '#555',
  textDecoration: 'none',
  fontSize: '13px',
  letterSpacing: '3px',
  fontWeight: 700,
  paddingBottom: '4px',
  borderBottom: active ? '2px solid #EE7700' : '2px solid transparent',
})

export default async function AdminWidgetPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; sort?: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('arnobot_admin')?.value
  if (!token || token !== process.env.ARNOBOT_ADMIN_KEY) redirect('/bot/admin/login')

  const params = await searchParams
  const today = new Date().toISOString().slice(0, 10)
  const from = params.from || today
  const to = params.to || today
  const sort = params.sort || 'date_desc'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('arno_blog_widget_logs')
    .select('*')
    .gte('created_at', `${from}T00:00:00`)
    .lte('created_at', `${to}T23:59:59`)
    .order('created_at', { ascending: true })

  const rows: LogRow[] = data || []

  const sessions: Record<string, LogRow[]> = {}
  for (const row of rows) {
    const key = row.session_id || row.ip || 'onbekend'
    if (!sessions[key]) sessions[key] = []
    sessions[key].push(row)
  }

  let sessionList = Object.entries(sessions)
  if (sort === 'date_desc') sessionList.sort((a, b) => b[1][0].created_at.localeCompare(a[1][0].created_at))
  if (sort === 'date_asc')  sessionList.sort((a, b) => a[1][0].created_at.localeCompare(b[1][0].created_at))
  if (sort === 'count_desc') sessionList.sort((a, b) => b[1].length - a[1].length)
  if (sort === 'count_asc')  sessionList.sort((a, b) => a[1].length - b[1].length)

  const dateRange = from === to ? from : `${from} t/m ${to}`

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', color: '#f0ede6', fontFamily: 'sans-serif', padding: '48px' }}>
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '32px', marginBottom: '40px' }}>
        <a href="/bot/admin" style={navLinkStyle(false)}>ROYAL DUTCH SALES</a>
        <a href="/bot/admin/widget" style={navLinkStyle(true)}>ARNO.BLOG WIDGET</a>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <p style={{ color: '#EE7700', fontSize: '16px', letterSpacing: '4px', marginBottom: '8px' }}>ARNOBOT — ARNO.BLOG WIDGET</p>
        <h1 style={{ fontSize: '48px', fontWeight: 700, margin: '0 0 32px 0', letterSpacing: '-1px' }}>Gesprekken</h1>

        <form method="GET" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '16px', letterSpacing: '2px', color: '#EE7700', opacity: 0.7 }}>VAN</label>
            <input type="date" name="from" defaultValue={from}
              style={{ background: '#111', border: '1px solid #222', color: '#f0ede6', padding: '10px 14px', fontSize: '16px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '16px', letterSpacing: '2px', color: '#EE7700', opacity: 0.7 }}>TOT EN MET</label>
            <input type="date" name="to" defaultValue={to}
              style={{ background: '#111', border: '1px solid #222', color: '#f0ede6', padding: '10px 14px', fontSize: '16px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '16px', letterSpacing: '2px', color: '#EE7700', opacity: 0.7 }}>SORTERING</label>
            <select name="sort" defaultValue={sort}
              style={{ background: '#111', border: '1px solid #222', color: '#f0ede6', padding: '10px 14px', fontSize: '16px' }}>
              <option value="date_desc">Nieuwste eerst</option>
              <option value="date_asc">Oudste eerst</option>
              <option value="count_desc">Meeste vragen eerst</option>
              <option value="count_asc">Minste vragen eerst</option>
            </select>
          </div>
          <button type="submit"
            style={{ background: '#EE7700', color: '#000', border: 'none', padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', alignSelf: 'flex-end' }}>
            LAAD
          </button>
          {sessionList.length > 0 && (
            <div style={{ alignSelf: 'flex-end' }}>
              <DownloadPdfButton sessions={sessionList} dateRange={dateRange} />
            </div>
          )}
        </form>
      </div>

      {sessionList.length === 0 ? (
        <p style={{ opacity: 0.4 }}>Geen gesprekken gevonden voor {dateRange}.</p>
      ) : (
        <div>
          <p style={{ opacity: 0.4, fontSize: '16px', marginBottom: '32px' }}>
            {sessionList.length} sessie{sessionList.length !== 1 ? 's' : ''} — {rows.length} berichten
          </p>
          {sessionList.map(([sessionId, messages], idx) => (
            <div key={sessionId} style={{ marginBottom: '56px', borderTop: '2px solid #EE7700', paddingTop: '20px' }}>
              <p style={{ fontSize: '16px', letterSpacing: '2px', color: '#EE7700', marginBottom: '4px', opacity: 0.7 }}>
                SESSIE {idx + 1} — {messages[0].ip}
              </p>
              <p style={{ fontSize: '16px', opacity: 0.3, marginBottom: '28px' }}>
                {new Date(messages[0].created_at).toLocaleTimeString('nl-NL')} – {new Date(messages[messages.length - 1].created_at).toLocaleTimeString('nl-NL')}
              </p>
              {messages.map((msg) => (
                <div key={msg.id} style={{ marginBottom: '28px' }}>
                  <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', color: '#f0ede6' }}>
                    {msg.question}
                  </p>
                  <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#aaa', whiteSpace: 'pre-wrap' }}>
                    {msg.answer}
                  </p>
                  <p style={{ fontSize: '11px', opacity: 0.25, marginTop: '6px' }}>
                    {new Date(msg.created_at).toLocaleTimeString('nl-NL')}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
    </main>
  )
}
