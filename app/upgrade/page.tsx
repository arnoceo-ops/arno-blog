export const metadata = {
  title: 'ArnoBot: Upgrade',
}

export default function UpgradePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600&family=DM+Sans:wght@400;500&family=Space+Mono:wght@400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1e293b; color: #f1f5f9; font-family: 'DM Sans', sans-serif; }

        /* NAV — exact copy homepage */
        .site-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0 40px; height: 60px; display: flex; align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(17,24,39,0.9); backdrop-filter: blur(12px);
        }
        .nav-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 3px; color: #f1f5f9; text-decoration: none; }
        .nav-logo span { color: #f59e0b; }
        .nav-spacer { flex: 1; }
        .nav-back { font-family: 'Bebas Neue', sans-serif; font-size: 15px; letter-spacing: 3px; color: #9ca3af; text-decoration: none; transition: color 0.2s; }
        .nav-back:hover { color: #f1f5f9; }

        /* DARK SECTION — exact copy subscribe-section */
        .subscribe-section {
          background: #1e293b; color: #f1f5f9;
          display: grid; grid-template-columns: 1fr 1fr;
          border-top: 3px solid #f59e0b;
        }
        .subscribe-text-col {
          padding: 80px 60px; border-right: 1px solid #374151;
          display: flex; align-items: flex-start; justify-content: flex-end;
        }
        .subscribe-text-inner {
          max-width: 540px; width: 100%;
          display: flex; flex-direction: column; gap: 16px; text-align: right;
        }
        .subscribe-right {
          padding: 80px 60px;
          display: flex; flex-direction: column; justify-content: flex-start; gap: 20px;
        }
        .subscribe-right-inner {
          max-width: 540px; width: 100%;
          display: flex; flex-direction: column; gap: 20px;
        }

        /* LIGHT SECTION — exact copy canvas-section */
        .canvas-section {
          background: #f1f5f9; display: grid; grid-template-columns: 1fr 1fr;
          border-top: 3px solid #f59e0b;
        }
        .canvas-left {
          padding: 80px 60px; border-right: 1px solid #ddd; display: flex;
          align-items: flex-start; justify-content: flex-end;
        }
        .canvas-left-inner { max-width: 540px; width: 100%; }
        .canvas-quote {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 4vw, 64px);
          line-height: 1.05; color: #1e293b;
          border-right: 4px solid #f59e0b; padding-right: 32px; text-align: right;
        }
        .canvas-quote em { font-style: normal; color: #f59e0b; }
        .canvas-right {
          padding: 80px 60px;
          display: flex; flex-direction: column; justify-content: center; gap: 24px;
        }
        .canvas-right-inner { max-width: 540px; width: 100%; display: flex; flex-direction: column; gap: 20px; }

        /* PRODUCT HEADER (left col) */
        .up-eyebrow { font-family: 'Space Mono', monospace; font-size: 13px; letter-spacing: 5px; color: #f59e0b; text-transform: uppercase; }
        .up-h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(52px,6vw,80px); line-height: 1; letter-spacing: 2px; color: #f1f5f9; }
        .up-desc { font-family: 'DM Sans', sans-serif; font-size: 16px; color: #9ca3af; line-height: 1.8; }
        .up-bullet { display: flex; gap: 12px; align-items: baseline; justify-content: flex-end; font-family: 'DM Sans', sans-serif; font-size: 15px; color: #9ca3af; line-height: 1.6; }
        .up-bullet::before { content: '←'; color: #f59e0b; font-family: 'Bebas Neue', sans-serif; font-size: 18px; flex-shrink: 0; }

        /* PRICING CARDS (right col, stacked) */
        .plan-card {
          padding: 28px 32px; border: 1px solid #374151;
          display: flex; flex-direction: column; gap: 10px;
          border-top: 3px solid transparent;
        }
        .plan-card-featured { border-top-color: #f59e0b; }
        .plan-badge { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 4px; color: #f59e0b; }
        .plan-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
        .plan-name { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 3px; color: #f1f5f9; }
        .plan-period { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #6b7280; text-transform: uppercase; }
        .plan-price { display: flex; align-items: baseline; gap: 4px; }
        .plan-cur { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #6b7280; line-height: 1; }
        .plan-amt { font-family: 'Bebas Neue', sans-serif; font-size: 56px; line-height: 1; letter-spacing: -1px; color: #f1f5f9; }
        .plan-sep { height: 1px; background: #374151; }
        .plan-features { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .plan-features li { display: flex; gap: 10px; align-items: flex-start; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #9ca3af; line-height: 1.5; }
        .plan-features li::before { content: '→'; color: #f59e0b; font-family: 'Bebas Neue', sans-serif; font-size: 16px; flex-shrink: 0; line-height: 1.4; }
        .btn-amber { display: block; background: #f59e0b; color: #111827; font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 3px; padding: 12px 28px; border-radius: 999px; text-decoration: none; text-align: center; transition: background 0.2s; margin-top: 4px; }
        .btn-amber:hover { background: #d97706; }
        .btn-outline { display: block; border: 1px solid #374151; color: #9ca3af; font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 3px; padding: 12px 28px; border-radius: 999px; text-decoration: none; text-align: center; transition: all 0.2s; margin-top: 4px; }
        .btn-outline:hover { border-color: #9ca3af; color: #f1f5f9; }

        /* KENNISMAKING (light) */
        .ken-eyebrow { font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: 4px; color: #f59e0b; }
        .ken-body { font-family: 'DM Sans', sans-serif; font-size: 16px; color: #6b7280; line-height: 1.8; }
        .btn-dark { display: inline-block; background: #111827; color: #f59e0b; font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 3px; padding: 14px 32px; border-radius: 999px; text-decoration: none; transition: background 0.2s; }
        .btn-dark:hover { background: #1e293b; }

        /* DIVIDER */
        .divider { background: #111827; padding: 40px 60px; display: flex; align-items: center; gap: 24px; }
        .divider-line { flex: 1; height: 1px; background: #374151; }
        .divider-label { font-family: 'Bebas Neue', sans-serif; font-size: 14px; letter-spacing: 6px; color: #6b7280; white-space: nowrap; }

        /* FOOTER — exact copy homepage */
        footer { background: #0d1117; padding: 40px 60px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #1f2937; }
        .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #f59e0b; letter-spacing: 3px; text-decoration: none; }
        .footer-copy { font-size: 10px; color: #374151; font-family: 'Space Mono', monospace; }

        /* MOBILE */
        @media (max-width: 768px) {
          .site-nav { padding: 12px 20px; }
          .subscribe-section { grid-template-columns: 1fr; }
          .subscribe-text-col { padding: 48px 24px; border-right: none; border-bottom: 1px solid #374151; justify-content: flex-start; }
          .subscribe-text-inner { text-align: left; }
          .up-bullet { justify-content: flex-start; }
          .up-bullet::before { content: '→'; }
          .subscribe-right { padding: 40px 24px; }
          .canvas-section { grid-template-columns: 1fr; }
          .canvas-left { padding: 48px 24px; border-right: none; border-bottom: 1px solid #ddd; justify-content: flex-start; }
          .canvas-quote { border-right: none; border-left: 4px solid #f59e0b; padding-right: 0; padding-left: 24px; text-align: left; }
          .canvas-right { padding: 40px 24px; }
          .divider { padding: 32px 24px; }
          footer { padding: 32px 24px; flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <nav className="site-nav" style={{paddingTop: 0}}>
        <a href="/" className="nav-logo">ARNO<span>BOT.</span></a>
        <div className="nav-spacer" />
        <a href="/bot" className="nav-back">← MIJN BOT</a>
      </nav>

      {/* ARNOLIVE — dark, links: product info, rechts: pricing cards */}
      <section className="subscribe-section" style={{paddingTop: '60px'}}>
        <div className="subscribe-text-col">
          <div className="subscribe-text-inner">
            <span className="up-eyebrow">Begeleiding</span>
            <h1 className="up-h1">ARNOLIVE</h1>
            <p className="up-desc">Maandelijks 45 minuten. Cut the crap. Korte en krachtige feedback.</p>
            <div className="up-bullet">45 minuten per sessie</div>
            <div className="up-bullet">Sessies via Proton Meet</div>
            <div className="up-bullet">Solo, met co-founder of heel het team</div>
          </div>
        </div>
        <div className="subscribe-right">
          <div className="subscribe-right-inner">
            <div className="plan-card">
              <div className="plan-header">
                <div className="plan-name">3 SESSIES</div>
                <div className="plan-period">Kwartaal</div>
              </div>
              <div className="plan-price">
                <span className="plan-cur">€</span>
                <span className="plan-amt">900</span>
              </div>
              <div className="plan-sep" />
              <ul className="plan-features">
                <li>Direct feedback op jouw situatie</li>
                <li>Geen voorbereiding nodig</li>
                <li>Flexibel per kwartaal</li>
              </ul>
              <a href="mailto:arnolive@arno.bot?subject=ARNOLIVE%20Kwartaal" className="btn-outline">STARTEN →</a>
            </div>
            <div className="plan-card plan-card-featured">
              <span className="plan-badge">Meest gekozen</span>
              <div className="plan-header">
                <div className="plan-name">12 SESSIES</div>
                <div className="plan-period">Jaar</div>
              </div>
              <div className="plan-price">
                <span className="plan-cur">€</span>
                <span className="plan-amt">2.700</span>
              </div>
              <div className="plan-sep" />
              <ul className="plan-features">
                <li>Continuïteit: Arno kent jouw context</li>
                <li>Grip op het hele jaar</li>
                <li>Één kwartaal gratis</li>
              </ul>
              <a href="mailto:arnolive@arno.bot?subject=ARNOLIVE%20Jaar" className="btn-amber">STARTEN →</a>
            </div>
          </div>
        </div>
      </section>

      {/* KENNISMAKING — light, exact canvas-section patroon */}
      <section className="canvas-section">
        <div className="canvas-left">
          <div className="canvas-left-inner">
            <div className="canvas-quote">
              Eerst kijken<br />
              of je het<br />
              <em>aandurft?</em>
            </div>
          </div>
        </div>
        <div className="canvas-right">
          <div className="canvas-right-inner">
            <span className="ken-eyebrow">Gratis · 30 minuten</span>
            <p className="ken-body">Plan een kennismakingsgesprek met Arno. Geen pitch, geen druk. Gewoon kijken of het klikt en wat voor jou werkt.</p>
            <div>
              <a href="https://calendly.com/arnodiepeveen/30min" target="_blank" rel="noopener noreferrer" className="btn-dark">
                PLAN EEN GESPREK →
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="divider">
        <div className="divider-line" />
        <span className="divider-label">NEXT LEVEL</span>
        <div className="divider-line" />
      </div>

      {/* ARNOPRIME — zelfde patroon als ARNOLIVE */}
      <section className="subscribe-section">
        <div className="subscribe-text-col">
          <div className="subscribe-text-inner">
            <span className="up-eyebrow">Interventie</span>
            <h1 className="up-h1">ARNOPRIME</h1>
            <p className="up-desc">Anderhalve dag op de hei. Jouw MT. Eén plan. Aligned.</p>
            <div className="up-bullet">1½ dag buiten kantoor</div>
            <div className="up-bullet">Voorbereiding op basis van Sales Canvas</div>
            <div className="up-bullet">All-in, overal in Europa</div>
          </div>
        </div>
        <div className="subscribe-right">
          <div className="subscribe-right-inner">
            <div className="plan-card">
              <div className="plan-header">
                <div className="plan-name">1 OF 2 PERSONEN</div>
                <div className="plan-period">Solo / Co-founders</div>
              </div>
              <div className="plan-price">
                <span className="plan-cur">€</span>
                <span className="plan-amt">7.900</span>
              </div>
              <div className="plan-sep" />
              <ul className="plan-features">
                <li>Pressure cooker sessie</li>
                <li>Vertrek met een plan dat staat</li>
                <li>Optioneel: extra dag mogelijk</li>
              </ul>
              <a href="mailto:arnoprime@arno.bot?subject=ARNOPRIME%20Solo" className="btn-outline">NEEM CONTACT OP →</a>
            </div>
            <div className="plan-card plan-card-featured">
              <span className="plan-badge">Management Team</span>
              <div className="plan-header">
                <div className="plan-name">MT-SESSIE</div>
                <div className="plan-period">Heel het MT</div>
              </div>
              <div className="plan-price">
                <span className="plan-cur">€</span>
                <span className="plan-amt">11.900</span>
              </div>
              <div className="plan-sep" />
              <ul className="plan-features">
                <li>Voorgesprek met ieder MT-lid apart</li>
                <li>Output: strak plan. Ready. Set. Go.</li>
                <li>Optioneel: extra dag mogelijk</li>
              </ul>
              <a href="mailto:arnoprime@arno.bot?subject=ARNOPRIME%20MT-sessie" className="btn-amber">NEEM CONTACT OP →</a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <a href="/" className="footer-logo">ARNOBOT.</a>
        <span className="footer-copy">© 2025 · arno.bot</span>
      </footer>
    </>
  )
}
