import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const INVENTORY = [
  { route: 'app/api/chat/route.ts (hoofdchat)', model: 'claude-sonnet-4-6', reden: 'Hoog volume, korte conversationele turns' },
  { route: 'app/api/bot/uitdaging/route.ts', model: 'claude-sonnet-4-6', reden: 'Dagelijkse mindsetvraag, één zin' },
  { route: 'app/api/bot/session-end/route.ts (synthese)', model: 'claude-haiku-4-5-20251001', reden: 'Drie snelle batch-calls per sessie' },
  { route: 'app/api/bot/coaching/route.ts (precheck)', model: 'claude-sonnet-4-6', reden: 'Ja/nee vraag, Fable 5 overkill' },
  { route: 'app/api/bot/coaching/route.ts (hoofdsynthese)', model: 'claude-fable-5', reden: 'Reasoning over gesprekken + profiel + patronen' },
  { route: 'app/api/bot/coaching/route.ts (blog-synthese)', model: 'claude-haiku-4-5-20251001', reden: 'Korte labels per blog' },
  { route: 'app/api/bot/coaching-analyse/route.ts (BIEB)', model: 'claude-sonnet-4-6', reden: 'Patroonanalyse max 20 gesprekken' },
]

function buildEmail(date: string): string {
  const rows = INVENTORY.map(item => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #374151; color: #9ca3af; font-size: 13px; font-family: 'Courier New', monospace;">${item.route}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #374151; color: #f59e0b; font-size: 13px; font-family: 'Courier New', monospace; white-space: nowrap;">${item.model}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #374151; color: #6b7280; font-size: 13px; font-family: 'Courier New', monospace;">${item.reden}</td>
    </tr>
  `).join('')

  return `
    <div style="background: #111827; color: #f1f5f9; padding: 40px; max-width: 720px; margin: 0 auto; font-family: 'Courier New', monospace;">
      <p style="color: #f59e0b; font-size: 12px; letter-spacing: 4px; margin: 0 0 8px;">ARNOBOT</p>
      <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px; color: #f1f5f9;">MAANDELIJKSE MODELCHECK</h1>
      <p style="color: #6b7280; font-size: 13px; margin: 0 0 32px;">${date}</p>

      <p style="color: #9ca3af; font-size: 14px; line-height: 1.8; margin: 0 0 24px;">
        Dit is de automatische herinnering om de modelkeuzes te controleren.<br>
        Check of Anthropic nieuwere of betere modellen heeft uitgebracht en pas aan waar nodig.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px 12px; color: #f59e0b; font-size: 11px; letter-spacing: 3px; border-bottom: 2px solid #374151;">ROUTE</th>
            <th style="text-align: left; padding: 8px 12px; color: #f59e0b; font-size: 11px; letter-spacing: 3px; border-bottom: 2px solid #374151;">MODEL</th>
            <th style="text-align: left; padding: 8px 12px; color: #f59e0b; font-size: 11px; letter-spacing: 3px; border-bottom: 2px solid #374151;">REDEN</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <p style="color: #6b7280; font-size: 13px; line-height: 1.8; margin: 0 0 8px;">
        Na een wijziging: update CLAUDE.md (modelinventaris-tabel) en de INVENTORY in deze route.
      </p>
      <p style="color: #6b7280; font-size: 13px;">
        Prijzen: <a href="https://platform.claude.com/docs/en/about-claude/pricing" style="color: #f59e0b;">platform.claude.com/docs/pricing</a>
      </p>
    </div>
  `
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const date = new Date().toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam',
  })

  try {
    await resend.emails.send({
      from: 'Arno <arno@arno.bot>',
      to: 'model@arno.bot',
      subject: `Modelcheck ${date}`,
      html: buildEmail(date),
    })
    return NextResponse.json({ ok: true, sent: date })
  } catch (e) {
    console.error('[model-check cron]', e)
    return NextResponse.json({ error: 'send_failed' }, { status: 500 })
  }
}
