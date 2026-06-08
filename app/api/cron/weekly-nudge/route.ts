import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Haal actieve gebruikers op die minstens 1 gesprek hebben gevoerd
  const { data: users } = await supabase
    .from('approved_users')
    .select('user_id, email, voornaam')
    .eq('is_active', true)
    .not('email', 'is', null)

  if (!users?.length) return NextResponse.json({ ok: true, sent: 0 })

  let sent = 0
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  for (const user of users) {
    if (!user.email) continue

    // Sla over als gebruiker afgelopen 7 dagen actief was (geen nudge nodig)
    const { count: recentCount } = await supabase
      .from('arnobot_rds_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user_id)
      .gte('created_at', sevenDaysAgo)

    if ((recentCount ?? 0) > 0) continue

    // Haal laatste open uitdaging op
    const { data: lastSession } = await supabase
      .from('arnobot_blog_sessions')
      .select('uitdaging, title, created_at')
      .eq('user_id', user.user_id)
      .eq('uitdaging_done', false)
      .not('uitdaging', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const naam = user.voornaam || 'hey'
    const uitdaging = lastSession?.uitdaging
    const gesprekTitel = lastSession?.title

    const subject = uitdaging
      ? `${naam}, je uitdaging staat nog open`
      : `${naam}, tijd voor een gesprek met Arno`

    const bodyHtml = uitdaging
      ? `
        <div style="font-family: 'Courier New', monospace; background: #0a0a0a; color: #f0ede6; padding: 40px; max-width: 560px; margin: 0 auto;">
          <p style="color: #EE7700; font-size: 12px; letter-spacing: 4px; margin-bottom: 32px;">ARNOBOT — ROYAL DUTCH SALES</p>
          <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 24px; line-height: 1.3;">Je uitdaging staat nog open.</h1>
          <div style="border-left: 3px solid #EE7700; padding: 16px 20px; background: #111; margin-bottom: 32px;">
            <p style="font-size: 13px; letter-spacing: 2px; color: #EE7700; margin-bottom: 8px;">UIT: ${gesprekTitel || 'JE LAATSTE GESPREK'}</p>
            <p style="font-size: 15px; line-height: 1.8; color: #f0ede6;">${uitdaging}</p>
          </div>
          <p style="font-size: 14px; color: #888; line-height: 1.8; margin-bottom: 32px;">Heb je dit gedaan? Of zit er nog iets in de weg? Kom terug en ga het gesprek aan.</p>
          <a href="https://arno.bot/bot" style="display: inline-block; background: #EE7700; color: #0a0a0a; font-weight: 700; font-size: 14px; letter-spacing: 3px; padding: 14px 28px; text-decoration: none;">OPEN DE BOT →</a>
        </div>
      `
      : `
        <div style="font-family: 'Courier New', monospace; background: #0a0a0a; color: #f0ede6; padding: 40px; max-width: 560px; margin: 0 auto;">
          <p style="color: #EE7700; font-size: 12px; letter-spacing: 4px; margin-bottom: 32px;">ARNOBOT — ROYAL DUTCH SALES</p>
          <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 24px; line-height: 1.3;">Je hebt een week niet gespart.</h1>
          <p style="font-size: 14px; color: #888; line-height: 1.8; margin-bottom: 32px;">Arno staat klaar. Wat houdt je bezig? Eén vraag is genoeg om weer scherp te worden.</p>
          <a href="https://arno.bot/bot" style="display: inline-block; background: #EE7700; color: #0a0a0a; font-weight: 700; font-size: 14px; letter-spacing: 3px; padding: 14px 28px; text-decoration: none;">OPEN DE BOT →</a>
        </div>
      `

    try {
      await resend.emails.send({
        from: 'Arno <arno@arno.bot>',
        to: user.email,
        subject,
        html: bodyHtml,
      })
      sent++
    } catch (e) {
      console.error(`Email naar ${user.email} mislukt:`, e)
    }
  }

  return NextResponse.json({ ok: true, sent })
}
