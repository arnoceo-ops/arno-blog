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

  const since = new Date()
  since.setDate(since.getDate() - 30)

  const { data, error } = await supabase
    .from('arnobot_blog_logs')
    .select('question')
    .gte('created_at', since.toISOString())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const dateStr = new Date().toISOString().slice(0, 10)

  if (!data || data.length === 0) {
    return NextResponse.json({ ok: true, message: 'Geen data' })
  }

  const openerCounts: Record<string, number> = {}
  for (const opener of PREDEFINED_OPENERS) openerCounts[opener] = 0
  let customTotal = 0

  for (const row of data) {
    if (PREDEFINED_OPENERS.includes(row.question)) {
      openerCounts[row.question]++
    } else {
      customTotal++
    }
  }

  const ranked = PREDEFINED_OPENERS
    .map((q, i) => ({ q, count: openerCounts[q], rank: i + 1 }))
    .sort((a, b) => b.count - a.count)

  const openerLines = ranked
    .map((item, i) => `  ${i + 1}. ${item.count}× "${item.q}"${item.count === 0 ? ' ← NOOIT GEBRUIKT' : ''}`)
    .join('\n')

  const unused = ranked.filter(o => o.count === 0).length
  const total = data.length
  const predefinedTotal = total - customTotal

  const text = `ARNOBOT — MAANDELIJKSE OPENERS ANALYSE
Afgelopen 30 dagen (t/m ${dateStr})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Totaal vragen         ${total}
Via opener gestart    ${predefinedTotal} (${Math.round(predefinedTotal / total * 100)}%)
Eigen vraag gestart   ${customTotal} (${Math.round(customTotal / total * 100)}%)
Nooit gebruikte openers  ${unused}/6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPENERS RANKING (meest → minst gebruikt)
${openerLines}

${unused > 0 ? `→ Overweeg de ${unused} ongebruikte opener(s) te vervangen door een relevantere vraag.` : '→ Alle openers worden gebruikt.'}
`

  const { error: mailError } = await resend.emails.send({
    from: 'ArnoBot <info@salescanvas.app>',
    to: ['arnodiepeveen@gmail.com'],
    subject: `ArnoBot openers ranking — ${ranked[0].count}× meest gebruikt`,
    text,
  })

  if (mailError) return NextResponse.json({ error: mailError }, { status: 500 })
  return NextResponse.json({ ok: true, total, unused })
}
