import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

const PREDEFINED_OPENERS = [
  'Mijn salesteam haalt structureel de targets niet. Waar ligt dat aan?',
  'Wat onderscheidt een winnende salesorganisatie van een gemiddelde?',
  "Hoe bouw ik een commerciële strategie die de markt op z'n kop zet?",
  'Mijn pipeline ziet er goed uit maar de conversie klopt niet. Oorzaken?',
  'Mijn beste verkoper vertrekt. Hoe had ik dat kunnen voorkomen?',
  'Wat is de route naar marktleider op een termijn van max. 24 maanden?',
]

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const since = new Date(now); since.setDate(since.getDate() - 7)
  const prevWeekStart = new Date(now); prevWeekStart.setDate(prevWeekStart.getDate() - 14)

  const [{ data }, { data: prevData }, { count: totalQuestions }, { data: allSessions }] = await Promise.all([
    supabase.from('arnobot_blog_logs').select('question, session_id, ip')
      .gte('created_at', since.toISOString()).order('created_at', { ascending: true }),
    supabase.from('arnobot_blog_logs').select('session_id, ip')
      .gte('created_at', prevWeekStart.toISOString()).lt('created_at', since.toISOString()),
    supabase.from('arnobot_blog_logs').select('*', { count: 'exact', head: true }),
    supabase.from('arnobot_blog_logs').select('session_id, ip'),
  ])

  const fromDate = since.toLocaleDateString('nl-NL', { timeZone: 'Europe/Amsterdam' })
  const toDate = now.toLocaleDateString('nl-NL', { timeZone: 'Europe/Amsterdam' })

  if (!data || data.length === 0) {
    await resend.emails.send({
      from: 'ArnoBot <info@salescanvas.app>',
      to: ['arnodiepeveen@gmail.com'],
      subject: `ArnoBot weekoverzicht — geen gesprekken`,
      text: `Geen ArnoBot-gesprekken in de week van ${fromDate} t/m ${toDate}.`,
    })
    return NextResponse.json({ ok: true, message: 'Geen logs deze week' })
  }

  const uniqueSessions = new Set((data ?? []).map(r => r.session_id || r.ip || 'onbekend'))
  const sessionCount = uniqueSessions.size
  const prevSessions = new Set((prevData ?? []).map(r => r.session_id || r.ip || 'onbekend')).size
  const prevQuestions = prevData?.length ?? 0
  const totalSessions = new Set((allSessions ?? []).map(r => r.session_id || r.ip || 'onbekend')).size

  const diff = (curr: number, prev: number) => {
    if (prev === 0) return ''
    const d = curr - prev
    return d > 0 ? ` (+${d})` : ` (${d})`
  }

  const predefinedCounts: Record<string, number> = {}
  for (const opener of PREDEFINED_OPENERS) predefinedCounts[opener] = 0
  let predefinedTotal = 0
  let customTotal = 0
  const customFreq: Record<string, number> = {}

  for (const row of data) {
    if (PREDEFINED_OPENERS.includes(row.question)) {
      predefinedCounts[row.question]++
      predefinedTotal++
    } else {
      customTotal++
      customFreq[row.question] = (customFreq[row.question] || 0) + 1
    }
  }

  const predefinedLines = PREDEFINED_OPENERS
    .filter(q => predefinedCounts[q] > 0)
    .map(q => `  • ${predefinedCounts[q]}× "${q}"`)
    .join('\n')

  const customLines = Object.entries(customFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([q, n]) => `  • ${n > 1 ? n + '× ' : ''}"${q}"`)
    .join('\n')

  const pct = (n: number) => Math.round((n / data.length) * 100)

  const text = `ARNOBOT — WEEKOVERZICHT
${fromDate} t/m ${toDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEZE WEEK               vs vorige week
Sessies (gesprekken)    ${sessionCount}${diff(sessionCount, prevSessions)}
Vragen totaal           ${data.length}${diff(data.length, prevQuestions)}
Voorgedefinieerd        ${predefinedTotal} (${pct(predefinedTotal)}%)
Eigen vragen            ${customTotal} (${pct(customTotal)}%)

CUMULATIEF (all-time)
Sessies totaal          ${totalSessions}
Vragen totaal           ${totalQuestions ?? '?'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VOORGEDEFINIEERDE VRAGEN
${predefinedLines || '  (geen)'}

EIGEN VRAGEN
${customLines || '  (geen)'}
`

  const { data: mailData, error: mailError } = await resend.emails.send({
    from: 'ArnoBot <info@salescanvas.app>',
    to: ['arnodiepeveen@gmail.com'],
    subject: `ArnoBot weekoverzicht — ${sessionCount} sessies, ${data.length} vragen`,
    text,
  })

  if (mailError) return NextResponse.json({ error: mailError }, { status: 500 })
  return NextResponse.json({ ok: true, sessions: sessionCount, questions: data.length, mailId: mailData?.id })
}
