import Link from 'next/link'

export default function ReferralSpelregelsPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111827; color: #f1f5f9; font-family: 'Space Mono', monospace; }

        .site-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 16px 40px; display: flex; justify-content: center;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(17,24,39,0.9); backdrop-filter: blur(12px);
        }
        .nav-links { display: flex; gap: 48px; align-items: center; }
        .nav-links a {
          color: #9ca3af; text-decoration: none;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 3px; transition: color 0.2s;
        }
        .nav-links a:hover { color: #f1f5f9; }

        .page { padding-top: 80px; min-height: 100vh; }

        .hero {
          padding: 80px 60px 60px;
          border-bottom: 3px solid #f59e0b;
        }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 7vw, 96px); line-height: 0.9; color: #f1f5f9;
        }
        .hero-title span { color: #f59e0b; }
        .hero-meta { font-size: 12px; color: #4b5563; margin-top: 16px; letter-spacing: 1px; }

        .body { max-width: 760px; margin: 0 auto; padding: 80px 40px 120px; }

        .section { margin-bottom: 56px; }
        .section-num {
          font-family: 'Bebas Neue', sans-serif; font-size: 13px;
          letter-spacing: 2px; color: #4b5563; margin-bottom: 6px;
        }
        .section-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 22px;
          letter-spacing: 2px; color: #f59e0b; margin-bottom: 20px;
        }
        p { font-size: 13px; color: #9ca3af; line-height: 1.9; margin-bottom: 16px; }
        strong { color: #f1f5f9; }
        a { color: #f59e0b; text-decoration: none; }
        a:hover { text-decoration: underline; }

        .divider { height: 1px; background: #1e293b; margin: 40px 0; }

        .tabel {
          width: 100%; border-collapse: collapse; margin-bottom: 24px;
          font-size: 13px; font-family: 'Space Mono', monospace;
        }
        .tabel th {
          text-align: left; padding: 10px 16px;
          font-size: 11px; letter-spacing: 3px; color: #f59e0b;
          border-bottom: 1px solid #374151;
        }
        .tabel td {
          padding: 12px 16px; color: #9ca3af; line-height: 1.7;
          border-bottom: 1px solid #1f2937;
          vertical-align: top;
        }
        .tabel td strong { color: #f1f5f9; }
        .tabel tr:last-child td { border-bottom: none; }

        footer {
          background: #0d1117; padding: 40px 60px;
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid #1f2937;
        }
        .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #f59e0b; letter-spacing: 3px; }
        .footer-copy { font-size: 10px; color: #374151; }

        @media (max-width: 600px) {
          .hero { padding: 60px 24px 40px; }
          .body { padding: 60px 24px 80px; }
          footer { padding: 32px 24px; flex-direction: column; gap: 12px; }
          .tabel th, .tabel td { padding: 10px 12px; }
        }
      `}</style>

      <nav className="site-nav">
        <div className="nav-links">
          <Link href="/">HOME</Link>
          <Link href="/bio">ARNO</Link>
          <a href="https://arno.bot/bot">BOT</a>
          <a href="https://salescanvas.app" target="_blank" rel="noopener noreferrer">CANVAS</a>
        </div>
      </nav>

      <div className="page">
        <div className="hero">
          <h1 className="hero-title"><span>REFERRAL</span> SPELREGELS</h1>
          <div className="hero-meta">ArnoBot Unlimited — Versie 1.0 · Juni 2026</div>
        </div>

        <div className="body">

          <div className="section">
            <div className="section-num">ARTIKEL 1</div>
            <div className="section-title">WAT IS HET REFERRALPROGRAMMA</div>
            <p>Iedere actieve ArnoBot-gebruiker ontvangt een persoonlijke referral link. Deelt hij of zij die link en meldt er iemand zich via aan, dan profiteren beide partijen van een korting zodra de nieuwe gebruiker een betaald abonnement afsluit.</p>
            <p>Deelname aan het programma is automatisch voor iedere actieve gebruiker. Er zijn geen aparte aanmeldstappen vereist.</p>
          </div>

          <div className="divider" />

          <div className="section">
            <div className="section-num">ARTIKEL 2</div>
            <div className="section-title">HOE HET WERKT</div>
            <p>De referrer deelt zijn of haar persoonlijke link (bijv. <strong>arno.bot/aanmelden?ref=ARNO-XXXX</strong>). De nieuwe gebruiker klikt op die link, doorloopt de standaard 30-daagse gratis trial en sluit daarna een abonnement af. Op dat moment worden de kortingen en het tegoed van toepassing.</p>
            <p>De referral link wordt gekoppeld op het moment dat de nieuwe gebruiker voor het eerst inlogt via de link. Een code kan maar eenmalig per account worden gebruikt.</p>
          </div>

          <div className="divider" />

          <div className="section">
            <div className="section-num">ARTIKEL 3</div>
            <div className="section-title">KORTINGEN BIJ CONVERSIE</div>
            <table className="tabel">
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
                  <td>Neemt maandabonnement (€97/m)</td>
                  <td>50% korting op de eerste maand — <strong>€48,50</strong></td>
                </tr>
                <tr>
                  <td><strong>Nieuwe gebruiker</strong></td>
                  <td>Neemt jaarabonnement (€777/j)</td>
                  <td>€97 korting — <strong>€680</strong></td>
                </tr>
                <tr>
                  <td><strong>Referrer</strong></td>
                  <td>Nieuwe gebruiker converteert naar maand</td>
                  <td>50% korting op de volgende maand — <strong>€48,50</strong></td>
                </tr>
                <tr>
                  <td><strong>Referrer</strong></td>
                  <td>Nieuwe gebruiker converteert naar jaar</td>
                  <td><strong>€97 tegoed</strong> op account</td>
                </tr>
              </tbody>
            </table>
            <p>Kortingen voor de referrer worden verrekend bij de eerstvolgende verlenging of worden bijgeschreven als tegoed. Er vindt geen separate uitbetaling of factuur plaats.</p>
          </div>

          <div className="divider" />

          <div className="section">
            <div className="section-num">ARTIKEL 4</div>
            <div className="section-title">SPELREGELS VOOR TEGOED</div>
            <p><strong>Tegoed is uitsluitend inzetbaar als verlenging</strong> van een bestaand maand- of jaarabonnement, of als bijdrage aan een tweede licentie. Uitbetaling in contanten of via andere betaalmethoden is niet mogelijk.</p>
            <p>Tegoed heeft <strong>geen vervaldatum</strong> en kent <strong>geen maximum</strong>. Het loopt door totdat het wordt ingezet voor een verlenging of tweede licentie.</p>
            <p>Bij vragen over het inzetten van tegoed neemt de gebruiker contact op via <a href="mailto:arno@arno.bot">arno@arno.bot</a>. Verrekening vindt op dit moment handmatig plaats.</p>
          </div>

          <div className="divider" />

          <div className="section">
            <div className="section-num">ARTIKEL 5</div>
            <div className="section-title">UITSLUITINGEN</div>
            <p>Teamlicenties zijn uitgesloten van het referralprogramma. Kortingen en tegoed gelden alleen voor individuele maand- en jaarabonnementen.</p>
            <p>Een gebruiker kan zijn eigen referral code niet gebruiken. Codes zijn persoonsgebonden en niet overdraagbaar.</p>
          </div>

          <div className="divider" />

          <div className="section">
            <div className="section-num">ARTIKEL 6</div>
            <div className="section-title">WIJZIGINGEN</div>
            <p>ArnoBot behoudt zich het recht voor de voorwaarden van het referralprogramma op elk moment te wijzigen. Bestaand tegoed dat is opgebouwd voor de wijziging blijft geldig onder de oorspronkelijke voorwaarden.</p>
            <p>Wijzigingen worden gecommuniceerd via e-mail en op de accountpagina.</p>
          </div>

          <div className="divider" />

          <p style={{ fontSize: 11, color: '#4b5563' }}>
            Vragen? Mail naar <a href="mailto:arno@arno.bot">arno@arno.bot</a>
          </p>

        </div>
      </div>

      <footer>
        <span className="footer-logo">ArnoBot</span>
        <span className="footer-copy">© Royal Dutch Sales 2026</span>
      </footer>
    </>
  )
}
