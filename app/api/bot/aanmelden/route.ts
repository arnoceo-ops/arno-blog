import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const serviceDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// eslint-disable-next-line @typescript-eslint/no-require-imports
const disposableDomains: string[] = require('disposable-email-domains')
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  try {
    const { naam, email, telefoon, linkedin } = await req.json()
    const voornaam = (naam || '').split(' ')[0]

    if (!naam || !email || !linkedin) {
      return NextResponse.json({ error: 'Naam, e-mailadres en LinkedIn zijn verplicht' }, { status: 400 })
    }
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 })
    }
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain || disposableDomains.includes(domain)) {
      return NextResponse.json({ error: 'Gebruik je zakelijke e-mailadres.' }, { status: 400 })
    }

    const { error: dbError } = await serviceDb
      .from('approved_users')
      .insert({
        user_id: `pending_${email}`,
        email,
        full_name: naam,
        telefoon: telefoon || null,
        linkedin: linkedin || null,
        trial_start: new Date().toISOString(),
        is_active: true,
      })

    if (dbError?.message.includes('duplicate') || dbError?.code === '23505') {
      return NextResponse.json({ success: true })
    }

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: 'Database fout' }, { status: 500 })
    }

    await resend.emails.send({
      from: 'ArnoBot <info@arno.bot>',
      to: email,
      subject: 'Je gratis trial staat klaar — ArnoBot Unlimited',
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #f0ede6; background: #0a0a0a;">
          <div style="padding: 24px 32px; border-bottom: 3px solid #EE7700;">
            <span style="font-family: 'Courier New', monospace; font-size: 18px; letter-spacing: 4px; color: #EE7700;">
              ARNOBOT <span style="color: #fff;">UNLIMITED</span>
            </span>
          </div>
          <div style="padding: 32px;">
            <h1 style="font-size: 32px; margin-bottom: 8px; color: #f0ede6; font-family: 'Courier New', monospace; letter-spacing: 2px;">
              Goed besluit, ${voornaam}.
            </h1>
            <p style="font-size: 15px; color: #888; line-height: 1.8; margin-bottom: 24px;">
              Je aanmelding voor <strong style="color: #f0ede6;">ArnoBot Unlimited</strong> is binnen.<br />
              Je hebt <strong style="color: #EE7700;">30 dagen gratis toegang</strong> — geen creditcard, geen verplichtingen.
            </p>
            <div style="background: #111; padding: 20px 24px; margin-bottom: 24px; border-left: 3px solid #EE7700;">
              <p style="font-size: 12px; letter-spacing: 2px; color: #EE7700; margin-bottom: 4px; text-transform: uppercase;">Jouw trial</p>
              <p style="font-size: 16px; font-weight: 600; color: #f0ede6; margin: 0;">30 dagen gratis — geen automatische afschrijving</p>
              <p style="font-size: 13px; color: #666; margin: 4px 0 0;">Na je trial geef je zelf per e-mail aan of je doorgaat.</p>
            </div>
            <p style="font-size: 15px; color: #888; line-height: 1.8; margin-bottom: 32px;">
              Maak nu je account aan via de knop hieronder — je hebt binnen een minuut toegang.
            </p>
            <a href="https://arno.bot/sign-up?email=${encodeURIComponent(email)}"
               style="display:inline-block;background:#EE7700;color:#0a0a0a;font-family:'Courier New',monospace;font-size:16px;font-weight:700;letter-spacing:3px;padding:16px 40px;text-decoration:none;border-radius:999px;">
              MAAK JE ACCOUNT AAN →
            </a>
            <p style="font-size: 13px; color: #555; line-height: 1.7; margin-top: 32px;">
              Vragen? Mail naar
              <a href="mailto:info@arno.bot" style="color: #EE7700;">info@arno.bot</a>
            </p>
          </div>
          <div style="padding: 16px 32px; border-top: 1px solid #1a1a1a;">
            <p style="font-size: 11px; color: #444; margin: 0; letter-spacing: 1px;">© 2026 ARNOBOT</p>
          </div>
        </div>
      `,
    })

    await resend.emails.send({
      from: 'ArnoBot <info@arno.bot>',
      to: 'arnodiepeveen@gmail.com',
      subject: `Nieuwe trial aanmelding: ${naam}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; color: #0a0a0a;">
          <h2 style="color: #EE7700;">Nieuwe ArnoBot trial aanmelding</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #777; width: 100px;">Naam</td><td style="padding: 8px 0;"><strong>${naam}</strong></td></tr>
            <tr><td style="padding: 8px 0; color: #777;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #EE7700;">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #777;">Telefoon</td><td style="padding: 8px 0;">${telefoon || '—'}</td></tr>
            <tr><td style="padding: 8px 0; color: #777;">LinkedIn</td><td style="padding: 8px 0;"><a href="${linkedin}" style="color: #EE7700;">${linkedin}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #777;">Trial start</td><td style="padding: 8px 0;">${new Date().toLocaleDateString('nl-NL')}</td></tr>
          </table>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Aanmelden error:', error)
    return NextResponse.json({ error: 'Server fout' }, { status: 500 })
  }
}
