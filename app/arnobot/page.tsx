import Link from 'next/link'

export default function ArnoBotLandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@300;600;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #f0ede6; font-family: 'Space Mono', monospace; }

        /* ── NAV ── */
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
        .nav-active { color: #EE7700 !important; }
        .nav-cta { color: #EE7700 !important; }
        .nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .nav-sub {
          font-family: 'Space Mono', monospace; font-size: 9px;
          letter-spacing: 2px; color: #444; text-decoration: none;
          text-transform: uppercase; transition: color 0.2s;
        }
        .nav-sub:hover { color: #EE7700 !important; }

        /* ── HERO ── */
        .ab-hero {
          padding-top: 80px;
          background: #0a0a0a;
          border-bottom: 3px solid #EE7700;
          display: grid; grid-template-columns: 1fr 1fr;
          min-height: 420px;
        }
        .ab-hero-left {
          padding: 80px 60px;
          border-right: 1px solid #1a1a1a;
          display: flex; flex-direction: column; justify-content: flex-end;
        }
        .ab-hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(80px, 12vw, 160px);
          line-height: 0.88; letter-spacing: -2px; color: #f0ede6;
        }
        .ab-hero-title span { color: #EE7700; }
        .ab-hero-right {
          padding: 80px 60px;
          display: flex; flex-direction: column; justify-content: flex-end; gap: 24px;
        }
        .ab-hero-label {
          font-size: 11px; letter-spacing: 4px; text-transform: uppercase;
          color: #EE7700; font-family: 'Space Mono', monospace;
        }
        .ab-hero-sub {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(28px, 3vw, 44px);
          font-weight: 600; line-height: 1.15; color: #f0ede6;
          letter-spacing: 1px; text-transform: uppercase;
        }
        .ab-hero-sub span { color: #EE7700; }
        .ab-hero-body {
          font-size: 13px; line-height: 2; color: #888; max-width: 420px;
        }

        /* ── FEATURES ── */
        .ab-features {
          background: #f0ede6;
          display: grid; grid-template-columns: 1fr 1fr;
        }
        .ab-features-left {
          padding: 80px 60px; border-right: 1px solid #ddd;
          display: flex; align-items: flex-start; justify-content: flex-end;
        }
        .ab-features-left-inner { max-width: 480px; width: 100%; }
        .ab-features-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 4vw, 64px);
          line-height: 1.05; color: #0a0a0a; letter-spacing: 1px;
          border-right: 4px solid #EE7700; padding-right: 32px;
          text-align: right;
        }
        .ab-features-heading span { color: #EE7700; }
        .ab-features-right {
          padding: 80px 60px;
          display: flex; flex-direction: column; gap: 0;
        }
        .ab-feature-item {
          display: flex; align-items: baseline; gap: 16px;
          padding: 20px 0; border-bottom: 1px solid #ddd;
        }
        .ab-feature-item:last-child { border-bottom: none; }
        .ab-feature-arrow { color: #EE7700; font-family: 'Bebas Neue', sans-serif; font-size: 20px; flex-shrink: 0; }
        .ab-feature-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 22px; font-weight: 600;
          color: #0a0a0a; letter-spacing: 0.5px;
          text-transform: uppercase; line-height: 1.2;
        }
        .ab-feature-text small {
          display: block; font-family: 'Space Mono', monospace;
          font-size: 11px; letter-spacing: 2px; color: #888;
          font-weight: 400; text-transform: none; margin-top: 4px;
        }

        /* ── PRICING ── */
        .ab-pricing {
          background: #0a0a0a;
          border-top: 3px solid #EE7700;
          display: grid; grid-template-columns: 1fr 1fr;
        }
        .ab-pricing-card {
          padding: 80px 60px;
          display: flex; flex-direction: column; gap: 24px;
          border-right: 1px solid #1a1a1a;
        }
        .ab-pricing-card:last-child { border-right: none; }
        .ab-pricing-card.featured { background: #111; }
        .ab-pricing-badge {
          display: inline-block; font-size: 10px; letter-spacing: 3px;
          text-transform: uppercase; color: #EE7700;
          font-family: 'Space Mono', monospace;
          border: 1px solid #EE7700; padding: 4px 12px;
          align-self: flex-start; border-radius: 999px;
        }
        .ab-pricing-type { font-family: 'Bebas Neue', sans-serif; font-size: 14px; letter-spacing: 4px; color: #555; }
        .ab-pricing-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(60px, 7vw, 100px);
          line-height: 0.9; color: #f0ede6; letter-spacing: -1px;
        }
        .ab-pricing-price span { font-size: clamp(20px, 2.5vw, 32px); color: #555; letter-spacing: 0; }
        .ab-pricing-sub { font-size: 12px; line-height: 1.8; color: #555; font-family: 'Space Mono', monospace; }
        .ab-pricing-sub strong { color: #EE7700; font-weight: 400; }
        .ab-pricing-btn {
          display: block; text-decoration: none; text-align: center;
          background: #EE7700; color: #0a0a0a;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px; letter-spacing: 3px;
          padding: 14px 18px; border-radius: 999px;
          width: 100%; max-width: 320px; transition: background 0.2s; margin-top: 8px;
        }
        .ab-pricing-btn:hover { background: #ff8800; }
        .ab-pricing-btn.dark { background: #1a1a1a; color: #888; }
        .ab-pricing-btn.dark:hover { background: #222; color: #f0ede6; }

        /* ── COMING SOON ── */
        .ab-coming {
          background: #f0ede6;
          border-top: 3px solid #EE7700;
          display: grid; grid-template-columns: 1fr 1fr;
          opacity: 0.6;
        }
        .ab-coming-left {
          padding: 80px 60px; border-right: 1px solid #ddd;
          display: flex; align-items: flex-end; justify-content: flex-end;
        }
        .ab-coming-tag {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px; letter-spacing: 6px; color: #aaa;
          border: 2px dashed #ccc; padding: 8px 20px;
        }
        .ab-coming-right { padding: 80px 60px; display: flex; flex-direction: column; gap: 16px; }
        .ab-coming-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 4vw, 64px);
          line-height: 1.05; color: #0a0a0a; letter-spacing: 1px;
        }
        .ab-coming-title span { color: #EE7700; }
        .ab-coming-body { font-size: 15px; line-height: 2; color: #888; max-width: 420px; }

        /* ── FOOTER ── */
        footer {
          background: #050505; padding: 40px 60px;
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid #111;
        }
        .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #EE7700; letter-spacing: 3px; text-decoration: none; }
        .footer-copy { font-size: 10px; color: #333; }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .site-nav { padding: 12px 20px; }
          .nav-links { gap: 20px; }
          .nav-links a { font-size: 17px; letter-spacing: 2px; }

          .ab-hero { grid-template-columns: 1fr; min-height: auto; }
          .ab-hero-left { padding: 60px 24px 32px; border-right: none; border-bottom: 1px solid #1a1a1a; }
          .ab-hero-right { padding: 40px 24px 60px; }

          .ab-features { grid-template-columns: 1fr; }
          .ab-features-left { padding: 48px 24px; border-right: none; border-bottom: 1px solid #ddd; justify-content: flex-start; }
          .ab-features-heading { border-right: none; border-left: 4px solid #EE7700; padding-right: 0; padding-left: 24px; text-align: left; }
          .ab-features-right { padding: 40px 24px; }

          .ab-pricing { grid-template-columns: 1fr; }
          .ab-pricing-card { padding: 48px 24px; border-right: none; border-bottom: 1px solid #1a1a1a; }
          .ab-pricing-btn { max-width: 100%; }

          .ab-coming { grid-template-columns: 1fr; }
          .ab-coming-left { padding: 40px 24px; border-right: none; border-bottom: 1px solid #ddd; justify-content: flex-start; }
          .ab-coming-right { padding: 40px 24px; }

          footer { padding: 32px 24px; flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav className="site-nav">
        <div className="nav-links">
          <Link href="/">HOME</Link>
          <Link href="/bio">ARNO</Link>
          <a href="https://www.royaldutchsales.com/arnobot" target="_blank" rel="noopener noreferrer" className="nav-active">BOT</a>
          <a href="https://salescanvas.app" target="_blank" rel="noopener noreferrer">CANVAS</a>
          <a href="https://arno.blog/subscribe" className="nav-cta">SUBSCRIBE</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="ab-hero">
        <div className="ab-hero-left">
          <h1 className="ab-hero-title">ARNO<span>BOT.</span></h1>
        </div>
        <div className="ab-hero-right">
          <span className="ab-hero-label">ArnoBot Unlimited</span>
          <p className="ab-hero-sub">Één advies kan je<br />tonnen opleveren.<br /><span>€97 per maand.</span></p>
          <p className="ab-hero-body">
            Dat is minder dan een kwartier consultancy. Maar je krijgt er geen kwartier voor terug — je krijgt er onbeperkt toegang voor. 19 jaar sales-expertise, direct beschikbaar. Elke vraag. Elke dag.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="ab-features">
        <div className="ab-features-left">
          <div className="ab-features-left-inner">
            <h2 className="ab-features-heading">WAT JE<br /><span>KRIJGT.</span></h2>
          </div>
        </div>
        <div className="ab-features-right">
          <div className="ab-feature-item">
            <span className="ab-feature-arrow">→</span>
            <span className="ab-feature-text">Onbeperkt vragen stellen<small>Geen limiet. Geen wachttijd.</small></span>
          </div>
          <div className="ab-feature-item">
            <span className="ab-feature-arrow">→</span>
            <span className="ab-feature-text">Sessiehistorie<small>Al je gesprekken bewaard en doorzoekbaar.</small></span>
          </div>
          <div className="ab-feature-item">
            <span className="ab-feature-arrow">→</span>
            <span className="ab-feature-text">PDF export<small>Exporteer elk gesprek als document.</small></span>
          </div>
          <div className="ab-feature-item">
            <span className="ab-feature-arrow">→</span>
            <span className="ab-feature-text">19 jaar blogarchief<small>Gefundeerd op 369.000+ woorden aan sales-inzichten.</small></span>
          </div>
          <div className="ab-feature-item">
            <span className="ab-feature-arrow">→</span>
            <span className="ab-feature-text">Direct antwoord<small>Geen corporate taal. Geen omwegen. Gewoon Arno.</small></span>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="ab-pricing">
        <div className="ab-pricing-card">
          <span className="ab-pricing-type">Maandelijks</span>
          <div className="ab-pricing-price">€97<span>/maand</span></div>
          <p className="ab-pricing-sub">
            Minder dan een kwartier consultancy.<br />
            Maar dan wel <strong>onbeperkt.</strong><br />
            Altijd opzegbaar.
          </p>
          <a href="https://royaldutchsales.com/arnobot?plan=monthly" target="_blank" rel="noopener noreferrer" className="ab-pricing-btn dark">START NU →</a>
        </div>
        <div className="ab-pricing-card featured">
          <span className="ab-pricing-badge">BESTE DEAL</span>
          <span className="ab-pricing-type">Jaarlijks</span>
          <div className="ab-pricing-price">€777<span>/jaar</span></div>
          <p className="ab-pricing-sub">
            €64,75 per maand.<br />
            <strong>Bespaar €387 ten opzichte van maandelijks.</strong>
          </p>
          <a href="https://royaldutchsales.com/arnobot?plan=yearly" target="_blank" rel="noopener noreferrer" className="ab-pricing-btn">START NU →</a>
        </div>
      </section>

      {/* COMING SOON */}
      <section className="ab-coming">
        <div className="ab-coming-left">
          <span className="ab-coming-tag">BINNENKORT</span>
        </div>
        <div className="ab-coming-right">
          <h2 className="ab-coming-title">ARNO<span> LIVE.</span></h2>
          <p className="ab-coming-body">
            Niet alleen de bot. Arno zelf. Persoonlijk sparren over jouw specifieke situatie — voor wie het echt meent.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <Link href="/" className="footer-logo">Royal Dutch Sales</Link>
        <span className="footer-copy">© Since 2007 — CC BY-ND 4.0</span>
      </footer>
    </>
  )
}
