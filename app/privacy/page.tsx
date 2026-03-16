import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Barlow:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #f0ede6; font-family: 'Space Mono', monospace; }

        .site-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 16px 40px; display: flex; justify-content: center;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,10,10,0.9); backdrop-filter: blur(12px);
        }
        .nav-links { display: flex; gap: 48px; align-items: center; }
        .nav-links a {
          color: #888; text-decoration: none;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 3px; transition: color 0.2s;
        }
        .nav-links a:hover { color: #f0ede6; }
        .nav-cta { color: #EE7700 !important; }

        .page { padding-top: 80px; min-height: 100vh; }

        .hero {
          padding: 80px 60px 60px;
          border-bottom: 3px solid #EE7700;
        }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 7vw, 96px); line-height: 0.9; color: #f0ede6;
        }
        .hero-title span { color: #EE7700; }
        .hero-meta { font-size: 12px; color: #444; margin-top: 16px; }

        .body { max-width: 760px; margin: 0 auto; padding: 80px 40px 120px; }

        .section { margin-bottom: 56px; }
        .section-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 22px;
          letter-spacing: 2px; color: #EE7700; margin-bottom: 20px;
        }
        .section-num {
          font-family: 'Bebas Neue', sans-serif; font-size: 13px;
          letter-spacing: 2px; color: #444; margin-bottom: 6px;
        }
        p { font-size: 13px; color: #888; line-height: 1.9; margin-bottom: 16px; }
        strong { color: #f0ede6; }
        a { color: #EE7700; text-decoration: none; }
        a:hover { text-decoration: underline; }
        ul { margin: 0 0 16px 0; padding-left: 20px; }
        ul li { font-size: 13px; color: #888; line-height: 1.9; }

        .divider { height: 1px; background: #1a1a1a; margin: 40px 0; }

        .notice {
          background: #0f0f0f; border-left: 3px solid #EE7700;
          padding: 20px 24px; margin-bottom: 40px;
          font-size: 12px; color: #666; line-height: 1.8;
        }

        footer {
          background: #050505; padding: 40px 60px;
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid #111;
        }
        .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #EE7700; letter-spacing: 3px; }
        .footer-copy { font-size: 10px; color: #333; }

        @media (max-width: 600px) {
          .hero { padding: 60px 24px 40px; }
          .body { padding: 60px 24px 80px; }
          footer { padding: 32px 24px; flex-direction: column; gap: 12px; }
        }
      `}</style>

      <nav className="site-nav">
        <div className="nav-links">
          <Link href="/">HOME</Link>
          <Link href="/spar">ARNOBOT</Link>
          <Link href="/bio">BIO</Link>
          <Link href="/blog">BLOG</Link>
          <Link href="/canvas">CANVAS</Link>
          <a href="/#subscribe" className="nav-cta">SUBSCRIBE</a>
        </div>
      </nav>

      <div className="page">
        <div className="hero">
          <h1 className="hero-title"><span>PRIVACY</span>VERKLARING</h1>
          <div className="hero-meta">Versie 1.0 — Januari 2025 · Royal Dutch Sales</div>
        </div>

        <div className="body">
          <div className="notice">
            Deze privacyverklaring is opgesteld conform de AVG (Algemene Verordening Gegevensbescherming) en dient te worden nagekeken door een juridisch adviseur vóór commerciële inzet.
          </div>

          <div className="section">
            <div className="section-num">ARTIKEL 1</div>
            <div className="section-title">VERWERKINGSVERANTWOORDELIJKE</div>
            <p>Royal Dutch Sales, vertegenwoordigd door Arno Diepeveen, is verwerkingsverantwoordelijke voor de persoonsgegevens die worden verwerkt via RDS Canvas en royaldutchsales.com.</p>
            <p>Contact: <a href="mailto:arno@royaldutchsales.com">arno@royaldutchsales.com</a></p>
          </div>

          <div className="divider" />

          <div className="section">
            <div className="section-num">ARTIKEL 2</div>
            <div className="section-title">WELKE GEGEVENS VERWERKEN WIJ?</div>
            <p>Bij aanmelding voor RDS Canvas verzamelen wij:</p>
            <ul>
              <li>Naam en emailadres</li>
              <li>Bedrijfsnaam</li>
              <li>Telefoonnummer (optioneel)</li>
              <li>Gekozen abonnementsvorm (Solo of Team)</li>
              <li>Gewenste startdatum en opmerkingen</li>
              <li>Hoe u ons heeft gevonden</li>
              <li>Opt-in voor marketingcommunicatie</li>
            </ul>
            <p>Bij gebruik van RDS Canvas verwerken wij:</p>
            <ul>
              <li>De antwoorden die u invoert in het Canvas platform</li>
              <li>Inloggegevens via Clerk (authenticatiedienst)</li>
              <li>Gebruiksdata voor het verbeteren van de dienst</li>
            </ul>
          </div>

          <div className="divider" />

          <div className="section">
            <div className="section-num">ARTIKEL 3</div>
            <div className="section-title">DOEL VAN VERWERKING</div>
            <p>Wij verwerken uw gegevens voor de volgende doeleinden:</p>
            <ul>
              <li>Het leveren en beheren van de RDS Canvas dienst</li>
              <li>Communicatie over uw account en abonnement</li>
              <li>Het versturen van marketingcommunicatie (alleen met uw toestemming)</li>
              <li>Het verbeteren van de dienstverlening</li>
              <li>Het voldoen aan wettelijke verplichtingen</li>
            </ul>
          </div>

          <div className="divider" />

          <div className="section">
            <div className="section-num">ARTIKEL 4</div>
            <div className="section-title">GRONDSLAG</div>
            <p>Wij verwerken uw gegevens op basis van:</p>
            <ul>
              <li><strong>Uitvoering van een overeenkomst</strong> — voor het leveren van RDS Canvas</li>
              <li><strong>Toestemming</strong> — voor marketingcommunicatie</li>
              <li><strong>Gerechtvaardigd belang</strong> — voor verbetering van de dienst</li>
            </ul>
          </div>

          <div className="divider" />

          <div className="section">
            <div className="section-num">ARTIKEL 5</div>
            <div className="section-title">DERDEN EN VERWERKERS</div>
            <p>Wij maken gebruik van de volgende verwerkers:</p>
            <ul>
              <li><strong>Clerk</strong> — authenticatie en accountbeheer (VS, Privacy Shield)</li>
              <li><strong>Supabase</strong> — opslag van Canvas data (EU)</li>
              <li><strong>Vercel</strong> — hosting van de applicatie (VS, Privacy Shield)</li>
              <li><strong>Resend</strong> — verzending van transactionele emails (VS)</li>
              <li><strong>Anthropic</strong> — AI-verwerking van Canvas antwoorden voor ArnoBot feedback</li>
            </ul>
            <p>Met alle verwerkers zijn verwerkersovereenkomsten afgesloten of worden standaard contractbepalingen gehanteerd.</p>
          </div>

          <div className="divider" />

          <div className="section">
            <div className="section-num">ARTIKEL 6</div>
            <div className="section-title">BEWAARTERMIJN</div>
            <p>Wij bewaren uw gegevens zolang uw account actief is. Na opzegging worden uw gegevens binnen <strong>90 dagen</strong> verwijderd, tenzij wettelijke verplichtingen een langere bewaartermijn vereisen.</p>
          </div>

          <div className="divider" />

          <div className="section">
            <div className="section-num">ARTIKEL 7</div>
            <div className="section-title">UW RECHTEN</div>
            <p>U heeft de volgende rechten met betrekking tot uw persoonsgegevens:</p>
            <ul>
              <li>Recht op inzage</li>
              <li>Recht op rectificatie</li>
              <li>Recht op verwijdering ("recht om vergeten te worden")</li>
              <li>Recht op beperking van verwerking</li>
              <li>Recht op dataportabiliteit</li>
              <li>Recht van bezwaar</li>
              <li>Recht om toestemming in te trekken</li>
            </ul>
            <p>Voor het uitoefenen van uw rechten kunt u contact opnemen via <a href="mailto:arno@royaldutchsales.com">arno@royaldutchsales.com</a>. Wij reageren binnen 30 dagen.</p>
          </div>

          <div className="divider" />

          <div className="section">
            <div className="section-num">ARTIKEL 8</div>
            <div className="section-title">BEVEILIGING</div>
            <p>Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te beveiligen tegen verlies, ongeautoriseerde toegang of misbruik. Dit omvat onder meer versleutelde verbindingen (HTTPS), toegangscontrole en regelmatige beveiligingscontroles.</p>
          </div>

          <div className="divider" />

          <div className="section">
            <div className="section-num">ARTIKEL 9</div>
            <div className="section-title">KLACHTEN</div>
            <p>Als u van mening bent dat wij uw persoonsgegevens niet correct verwerken, heeft u het recht een klacht in te dienen bij de Autoriteit Persoonsgegevens via <a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">autoriteitpersoonsgegevens.nl</a>.</p>
          </div>

          <div className="divider" />

          <p style={{ fontSize: 11, color: '#444' }}>
            Vragen over deze privacyverklaring? Mail naar <a href="mailto:arno@royaldutchsales.com">arno@royaldutchsales.com</a>
          </p>

        </div>
      </div>

      <footer>
        <span className="footer-logo">Royal Dutch Sales</span>
        <span className="footer-copy">© Since 2007 — CC BY-ND 4.0</span>
      </footer>
    </>
  )
}
