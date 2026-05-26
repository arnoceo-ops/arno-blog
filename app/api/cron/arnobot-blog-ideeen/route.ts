import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 120

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const cronAuth = req.headers.get('authorization')
  if (cronAuth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const since = new Date()
  since.setDate(since.getDate() - 7)

  const { data, error } = await supabase
    .from('arnobot_blog_logs')
    .select('created_at, question, answer')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const dateStr = new Date().toISOString().slice(0, 10)

  if (!data || data.length === 0) {
    await resend.emails.send({
      from: 'ArnoBot <info@salescanvas.app>',
      to: ['arnodiepeveen@gmail.com'],
      subject: `ArnoBot blog-ideeën — week van ${dateStr}`,
      text: 'Geen blog-bezoekers deze week die de ArnoBot hebben gebruikt.',
    })
    return NextResponse.json({ ok: true, count: 0 })
  }

  const logSummary = data.map(row => {
    const datum = new Date(row.created_at).toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })
    const antwoord = (row.answer || '').slice(0, 300)
    return `[${datum}]\nVraag: ${row.question}\nAntwoord: ${antwoord}…`
  }).join('\n\n')

  let aiResponse
  try {
    aiResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Je bent een content-strateeg voor arno.blog, het blog van Arno Diepeveen over B2B sales en commerciële strategie. Analyseer deze vragen die bezoekers deze week aan de ArnoBot hebben gesteld.

VRAGEN (${data.length} totaal):
${logSummary}

Schrijf een beknopt rapport in het Nederlands met:
1. **Terugkerende thema's** — welke onderwerpen of vragen kwamen meerdere keren terug?
2. **Blog-ideeën** — 3 concrete blogartikel-ideeën gebaseerd op deze vragen (met werktitel)
3. **Gaps** — onderwerpen waar bezoekers naar vragen maar die nog niet goed gedekt zijn op het blog

Kort en to-the-point. Geen inleiding, direct de analyse.`,
    }],
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'Claude API fout', detail: msg }, { status: 500 })
  }

  const analyse = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : 'Analyse mislukt.'

  const escape = (s: string) => `"${(s || '').replace(/"/g, '""')}"`
  const csvHeader = 'Datum,Vraag,Antwoord\n'
  const csvRows = data.map(row => {
    const datum = new Date(row.created_at).toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })
    return [escape(datum), escape(row.question), escape(row.answer)].join(',')
  })
  const csv = csvHeader + csvRows.join('\n')

  const html = `<div style="font-family: sans-serif; max-width: 640px; line-height: 1.7; color: #111;">
<h2 style="margin-bottom: 4px;">ArnoBot blog-ideeën — week van ${dateStr}</h2>
<p style="color: #666; margin-top: 0;">${data.length} vragen van bezoekers</p>
<hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;">
${analyse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}
<hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
<p style="color: #999; font-size: 12px;">Ruwe logs in bijlage.</p>
</div>`

  await resend.emails.send({
    from: 'ArnoBot <info@salescanvas.app>',
    to: ['arnodiepeveen@gmail.com'],
    subject: `ArnoBot blog-ideeën — week van ${dateStr}`,
    html,
    attachments: [
      {
        filename: `arnobot-blog-logs-${dateStr}.csv`,
        content: Buffer.from(csv, 'utf-8'),
      },
    ],
  })

  return NextResponse.json({ ok: true, count: data.length })
}
