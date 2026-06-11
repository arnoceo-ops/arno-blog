import Link from 'next/link'

export const metadata = {
  title: 'Referral Spelregels →ArnoBot',
  robots: 'noindex',
}

export default function ReferralSpelregelsPage() {
  const section: React.CSSProperties = { borderTop: '1px solid #374151', paddingTop: 32, marginBottom: 48 }
  const label: React.CSSProperties = { fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 8, display: 'block' }
  const num: React.CSSProperties = { fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 13, letterSpacing: 2, color: '#4b5563', marginBottom: 6, display: 'block' }
  const h2: React.CSSProperties = { fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: '#f1f5f9', marginBottom: 20, lineHeight: 1 }
  const body: React.CSSProperties = { fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 15, lineHeight: 1.9, color: '#9ca3af', marginBottom: 16 }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111827; color: #f1f5f9; font-family: 'Space Mono', monospace; font-weight: 400; }
        a { color: #f59e0b; text-decoration: none; }
        a:hover { text-decoration: underline; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th { background: #1f2937; color: #f59e0b; font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 3px; text-align: left; padding: 10px 14px; border-bottom: 2px solid #374151; }
        td { font-family: 'Space Mono', monospace; font-size: 14px; color: #9ca3af; padding: 12px 14px; border-bottom: 1px solid #1f2937; vertical-align: top; line-height: 1.7; }
        td strong { color: #f1f5f9; }
        tr:last-child td { border-bottom: none; }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 clamp(20px, 4vw, 40px)', height: 64,
        display: 'flex', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(12px)',
      }}>
        <Link href="/bot/account" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, color: '#f1f5f9', textDecoration: 'none' }}>
          ARNO<span style={{ color: '#f59e0b' }}>BOT.</span>
        </Link>
      </nav>

      <div style={{ minHeight: '100vh', background: '#111827' }}>
        <div style={{ maxWidth: 812, margin: '0 auto', padding: 'clamp(80px,12vw,120px) clamp(16px,4vw,20px) 80px' }}>

          <p style={{ ...label, marginBottom: 8 }}>ARNOBOT</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, color: '#f1f5f9', lineHeight: 1.0, marginBottom: 16 }}>REFERRAL SPELREGELS</h1>
          <p style={{ ...body, marginBottom: 64 }}>Versie 1.0 · Juni 2026</p>

          <div style={section}>
            <span style={num}>ARTIKEL 1</span>
            <h2 style={h2}>WAT IS HET REFERRALPROGRAMMA</h2>
            <p style={body}>Je ontvangt als actieve ArnoBot-gebruiker een persoonlijke referral link. Deel je die link en meldt iemand zich daarmee aan, dan profiteren zowel jij als de nieuwe gebruiker van een korting zodra de laatstgenoemde een betaald abonnement afsluit.</p>
            <p style={body}>Deelname is automatisch voor iedere actieve gebruiker. Er zijn geen aparte aanmeldstappen vereist.</p>
          </div>

          <div style={section}>
            <span style={num}>ARTIKEL 2</span>
            <h2 style={h2}>HOE HET WERKT</h2>
            <p style={body}>De referrer deelt zijn of haar persoonlijke link (bijv. <strong style={{ color: '#f1f5f9' }}>arno.bot/aanmelden?ref=NAAM-XXXX</strong>). De nieuwe gebruiker klikt op die link, doorloopt de standaard 30-daagse gratis trial en sluit daarna een abonnement af. Op dat moment worden de kortingen en het tegoed van toepassing.</p>
            <p style={body}>Een referral code wordt eenmalig per account gekoppeld, op het moment van de eerste inlog via de link.</p>
          </div>

          <div style={section}>
            <span style={num}>ARTIKEL 3</span>
            <h2 style={h2}>KORTINGEN BIJ CONVERSIE</h2>
            <table>
              <thead>
                <tr>
                  <th>WIE</th>
                  <th>SCENARIO</th>
                  <th>VOORDEEL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Nieuwe gebruiker</strong></td>
                  <td>Maandabonnement (€97/m)</td>
                  <td>50% korting eerste maand → <strong>€48,50</strong></td>
                </tr>
                <tr>
                  <td><strong>Nieuwe gebruiker</strong></td>
                  <td>Jaarabonnement (€777/j)</td>
                  <td>€97 korting → <strong>€680</strong></td>
                </tr>
                <tr>
                  <td><strong>Referrer</strong></td>
                  <td>Nieuwe gebruiker converteert naar maand</td>
                  <td>50% korting volgende maand → <strong>€48,50</strong></td>
                </tr>
                <tr>
                  <td><strong>Referrer</strong></td>
                  <td>Nieuwe gebruiker converteert naar jaar</td>
                  <td><strong>€97 tegoed</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={section}>
            <span style={num}>ARTIKEL 4</span>
            <h2 style={h2}>SPELREGELS VOOR TEGOED</h2>
            <p style={body}>Tegoed is uitsluitend inzetbaar als verlenging van een bestaand maand- of jaarabonnement, of als bijdrage aan een tweede licentie. Uitbetaling in contanten of via andere betaalmethoden is niet mogelijk.</p>
            <p style={body}>Tegoed heeft geen vervaldatum en kent geen maximum. Het loopt door totdat het wordt ingezet voor een verlenging of tweede licentie.</p>
            <p style={body}>Verrekening vindt handmatig plaats via <a href="mailto:referrals@arno.bot">referrals@arno.bot</a>.</p>
          </div>

          <div style={section}>
            <span style={num}>ARTIKEL 5</span>
            <h2 style={h2}>UITSLUITINGEN</h2>
            <p style={body}>Teamlicenties zijn uitgesloten van het referralprogramma. Kortingen en tegoed gelden alleen voor individuele abonnementen.</p>
            <p style={body}>Een gebruiker kan zijn of haar eigen referral code niet gebruiken. Codes zijn persoonsgebonden en niet overdraagbaar.</p>
          </div>

          <div style={section}>
            <span style={num}>ARTIKEL 6</span>
            <h2 style={h2}>WIJZIGINGEN</h2>
            <p style={body}>ArnoBot behoudt zich het recht voor de voorwaarden van het referralprogramma op elk moment te wijzigen. Bestaand tegoed opgebouwd voor de wijziging blijft geldig onder de oorspronkelijke voorwaarden.</p>
          </div>

          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#4b5563', lineHeight: 1.8, marginTop: 16 }}>
            Vragen? Mail naar <a href="mailto:referrals@arno.bot">referrals@arno.bot</a>
          </p>

        </div>
      </div>
    </>
  )
}
