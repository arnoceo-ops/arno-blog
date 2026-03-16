import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { naam, email, bedrijf, plan, seats, hoe, startdatum, opmerkingen, marketing } = body;

    if (!naam || !email || !bedrijf || !plan) {
      return NextResponse.json({ error: 'Ontbrekende velden' }, { status: 400 });
    }

    const planLabel = plan === 'team' ? `Team (${seats} gebruikers)` : 'Solo';
    const startLabel = startdatum || 'Zo snel mogelijk';

    // 1. Bevestigingsmail naar klant
    await resend.emails.send({
      from: 'Royal Dutch Sales <noreply@royaldutchsales.com>',
      to: email,
      subject: 'Aanmelding RDS Canvas ontvangen',
      html: `
        <div style="background:#0a0a0a;color:#f0ede6;font-family:'Courier New',monospace;padding:48px 40px;max-width:600px;margin:0 auto;">
          <div style="font-size:32px;font-weight:700;color:#EE7700;letter-spacing:3px;margin-bottom:8px;">ROYAL DUTCH SALES</div>
          <div style="font-size:13px;color:#888;margin-bottom:40px;letter-spacing:1px;">RDS CANVAS</div>

          <div style="font-size:22px;color:#f0ede6;margin-bottom:24px;">Hoi ${naam},</div>

          <p style="font-size:14px;color:#aaa;line-height:1.8;margin-bottom:24px;">
            Je aanmelding voor RDS Canvas is ontvangen. Je hoort binnen 24 uur van ons — dan ontvang je je inloggegevens en kun je direct starten.
          </p>

          <div style="background:#111;border-left:3px solid #EE7700;padding:20px 24px;margin-bottom:32px;">
            <div style="font-size:11px;color:#EE7700;letter-spacing:2px;margin-bottom:16px;">JOUW AANMELDING</div>
            <table style="font-size:13px;color:#888;width:100%;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#666;">Plan</td><td style="padding:4px 0;color:#f0ede6;">${planLabel}</td></tr>
              <tr><td style="padding:4px 0;color:#666;">Bedrijf</td><td style="padding:4px 0;color:#f0ede6;">${bedrijf}</td></tr>
              <tr><td style="padding:4px 0;color:#666;">Gewenste start</td><td style="padding:4px 0;color:#f0ede6;">${startLabel}</td></tr>
            </table>
          </div>

          <p style="font-size:13px;color:#666;line-height:1.8;margin-bottom:32px;">
            Vragen? Stuur een mail naar <a href="mailto:arno@royaldutchsales.com" style="color:#EE7700;text-decoration:none;">arno@royaldutchsales.com</a>
          </p>

          <div style="border-top:1px solid #1a1a1a;padding-top:24px;font-size:11px;color:#444;">
            Royal Dutch Sales · © Since 2007
            ${marketing ? '' : '<br>Je ontvangt geen marketingmails van ons.'}
          </div>
        </div>
      `,
    });

    // 2. Notificatie naar Arno
    await resend.emails.send({
      from: 'RDS Canvas <noreply@royaldutchsales.com>',
      to: 'arno@royaldutchsales.com',
      subject: `🟠 Nieuwe aanmelding: ${naam} — ${planLabel}`,
      html: `
        <div style="font-family:'Courier New',monospace;padding:32px;max-width:600px;background:#0a0a0a;color:#f0ede6;">
          <div style="font-size:24px;color:#EE7700;margin-bottom:24px;">NIEUWE AANMELDING</div>
          <table style="font-size:14px;color:#aaa;width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#666;width:140px;">Naam</td><td style="color:#f0ede6;">${naam}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Email</td><td style="color:#EE7700;"><a href="mailto:${email}" style="color:#EE7700;">${email}</a></td></tr>
            <tr><td style="padding:6px 0;color:#666;">Bedrijf</td><td style="color:#f0ede6;">${bedrijf}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Plan</td><td style="color:#f0ede6;">${planLabel}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Startdatum</td><td style="color:#f0ede6;">${startLabel}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Gevonden via</td><td style="color:#f0ede6;">${hoe || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Marketing opt-in</td><td style="color:#f0ede6;">${marketing ? 'Ja' : 'Nee'}</td></tr>
            <tr><td style="padding:6px 0;color:#666;vertical-align:top;">Opmerkingen</td><td style="color:#f0ede6;">${opmerkingen || '—'}</td></tr>
          </table>

          <div style="margin-top:32px;padding:16px;background:#111;border-left:3px solid #EE7700;font-size:13px;color:#888;">
            <strong style="color:#EE7700;">Actie:</strong> Maak Clerk account aan voor ${email} en zet approved_users rij klaar (plan: ${plan}, seats: ${seats ?? 1}).
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Aanmelden error:', err);
    return NextResponse.json({ error: 'Verzenden mislukt' }, { status: 500 });
  }
}
