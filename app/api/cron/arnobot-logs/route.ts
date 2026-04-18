import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const since = new Date()
  since.setDate(since.getDate() - 7)

  const { data, error } = await supabase
    .from('arnobot_blog_logs')
    .select('created_at, question, answer, ip')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ ok: true, message: 'Geen logs deze week' })
  }

  const header = 'Datum,Vraag,Antwoord,IP\n'
  const rows = data.map(row => {
    const datum = new Date(row.created_at).toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })
    const escape = (s: string) => `"${(s || '').replace(/"/g, '""')}"`
    return [escape(datum), escape(row.question), escape(row.answer), escape(row.ip || '')].join(',')
  })
  const csv = header + rows.join('\n')

  const dateStr = new Date().toISOString().slice(0, 10)

  await resend.emails.send({
    from: 'ArnoBot <noreply@royaldutchsales.com>',
    to: ['arno@royaldutchsales.com', 'arnodiepeveen@gmail.com'],
    subject: `ArnoBot logs — week van ${dateStr}`,
    text: `${data.length} vragen deze week. Zie bijlage.`,
    attachments: [
      {
        filename: `arnobot-logs-${dateStr}.csv`,
        content: Buffer.from(csv, 'utf-8'),
      },
    ],
  })

  return NextResponse.json({ ok: true, count: data.length })
}
