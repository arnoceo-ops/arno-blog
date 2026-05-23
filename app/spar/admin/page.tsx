import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import PrintButton from './PrintButton'

type LogRow = {
  id: string
  created_at: string
  question: string
  answer: string
  ip: string
  session_id: string
}

export default async function ArnoBotAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; key?: string }>
}) {
  const params = await searchParams

  if (!params.key || params.key !== process.env.ARNOBOT_ADMIN_KEY) {
    redirect('/')
  }

  const date = params.date || new Date().toISOString().slice(0, 10)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('arnobot_blog_logs')
    .select('*')
    .like('session_id', `%-${date}`)
    .order('created_at', { ascending: true })

  const rows: LogRow[] = data || []

  const sessions: Record<string, LogRow[]> = {}
  for (const row of rows) {
    if (!sessions[row.session_id]) sessions[row.session_id] = []
    sessions[row.session_id].push(row)
  }

  const sessionList = Object.entries(sessions)

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; color: black; }
          .session-block { page-break-inside: avoid; }
        }
        body { background: #0a0a0a; color: #f0ede6; font-family: sans-serif; padding: 48px; }
      `}</style>

      <div className="no-print" style={{ marginBottom: '40px', display: 'flex', gap: '24px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <p style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '3px', marginBottom: '8px' }}>ARNOBOT GESPREKKEN</p>
          <h1 style={{ fontSize: '48px', fontWeight: 700, margin: 0 }}>Export</h1>
        </div>
        <form method="GET" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input type="hidden" name="key" value={params.key} />
          <input
            type="date"
            name="date"
            defaultValue={date}
            style={{ background: '#111', border: '1px solid #333', color: '#f0ede6', padding: '10px 14px', fontSize: '14px' }}
          />
          <button
            type="submit"
            style={{ background: '#EE7700', color: '#000', border: 'none', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
          >
            Laad
          </button>
        </form>
        {sessionList.length > 0 && <PrintButton />}
      </div>

      {sessionList.length === 0 ? (
        <p style={{ opacity: 0.4 }}>Geen gesprekken gevonden voor {date}.</p>
      ) : (
        <div>
          <p className="no-print" style={{ opacity: 0.4, fontSize: '13px', marginBottom: '32px' }}>
            {sessionList.length} sessie{sessionList.length !== 1 ? 's' : ''} — {rows.length} berichten
          </p>
          {sessionList.map(([sessionId, messages], idx) => (
            <div key={sessionId} className="session-block" style={{ marginBottom: '64px', borderTop: '2px solid #EE7700', paddingTop: '24px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '2px', color: '#EE7700', marginBottom: '4px', opacity: 0.7 }}>
                SESSIE {idx + 1} — {messages[0].ip}
              </p>
              <p style={{ fontSize: '11px', opacity: 0.3, marginBottom: '32px' }}>
                {new Date(messages[0].created_at).toLocaleTimeString('nl-NL')} – {new Date(messages[messages.length - 1].created_at).toLocaleTimeString('nl-NL')}
              </p>
              {messages.map((msg) => (
                <div key={msg.id} style={{ marginBottom: '32px' }}>
                  <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px', color: '#f0ede6' }}>
                    {msg.question}
                  </p>
                  <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#aaa', whiteSpace: 'pre-wrap' }}>
                    {msg.answer}
                  </p>
                  <p style={{ fontSize: '11px', opacity: 0.25, marginTop: '8px' }}>
                    {new Date(msg.created_at).toLocaleTimeString('nl-NL')}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
