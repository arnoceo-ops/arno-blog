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

        /* NAV */
        .up-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(17,24,39,0.9); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 40px; height: 60px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .up-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 3px; color: #f1f5f9; text-decoration: none; }
        .up-logo span { color: #f59e0b; }
        .up-back { font-family: 'Bebas Neue', sans-serif; font-size: 15px; letter-spacing: 3px; color: #9ca3af; text-decoration: none; transition: color 0.2s; }
        .up-back:hover { color: #f1f5f9; }

        /* DARK SECTION */
        .dark-section { background: #1e293b; border-top: 3px solid #f59e0b; }

        /* PRODUCT HEADER */
        .product-header { padding: clamp(48px,6vw,80px) clamp(24px,5vw,60px) clamp(32px,4vw,48px); }
        .up-eyebrow { font-family: 'Space Mono', monospace; font-size: 13px; letter-spacing: 5px; color: #f59e0b; display: block; margin-bottom: 12px; text-transform: uppercase; }
        .up-h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(52px,7vw,88px); line-height: 1; letter-spacing: 2px; color: #f1f5f9; margin-bottom: 16px; }
        .up-lead { font-family: 'DM Sans', sans-serif; font-size: 16px; color: #9ca3af; line-height: 1.8; max-width: 520px; }

        /* PRICING GRID */
        .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid #374151; }
        .pricing-col { padding: clamp(32px,5vw,60px); display: flex; flex-direction: column; border-top: 3px solid transparent; }
        .pricing-col-left { border-right: 1px solid #374151; }
        .pricing-col-featured { border-top-color: #f59e0b; }

        .plan-badge { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 4px; color: #f59e0b; display: block; margin-bottom: 16px; }
        .plan-name { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 3px; color: #f1f5f9; margin-bottom: 4px; }
        .plan-period { font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: 4px; color: #6b7280; margin-bottom: 24px; text-transform: uppercase; }
        .plan-price { display: flex; align-items: baseline; gap: 6px; margin-bottom: 28px; }
        .plan-cur { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #6b7280; line-height: 1; }
        .plan-amt { font-family: 'Bebas Neue', sans-serif; font-size: 72px; line-height: 1; letter-spacing: -2px; color: #f1f5f9; }
        .plan-sep { height: 1px; background: #374151; margin-bottom: 28px; }

        .plan-features { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 14px; margin-bottom: 36px; flex: 1; }
        .plan-features li { display: flex; gap: 14px; align-items: flex-start; font-family: 'DM Sans', sans-serif; font-size: 15px; color: #9ca3af; line-height: 1.6; }
        .plan-features li::before { content: '→'; color: #f59e0b; font-family: 'Bebas Neue', sans-serif; font-size: 18px; flex-shrink: 0; line-height: 1.4; }

        .btn-amber { display: block; background: #f59e0b; color: #111827; font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 3px; padding: 14px 32px; border-radius: 999px; text-decoration: none; text-align: center; transition: background 0.2s; }
        .btn-amber:hover { background: #d97706; }
        .btn-outline { display: block; border: 1px solid #374151; color: #9ca3af; font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 3px; padding: 14px 32px; border-radius: 999px; text-decoration: none; text-align: center; transition: all 0.2s; }
        .btn-outline:hover { border-color: #9ca3af; color: #f1f5f9; }

        /* LIGHT SECTION (KENNISMAKING) — zelfde patroon als homepage canvas-section */
        .light-section { background: #f1f5f9; border-top: 3px solid #f59e0b; display: grid; grid-template-columns: 1fr 1fr; }
        .ken-left { padding: clamp(48px,6vw,80px) clamp(24px,5vw,60px); border-right: 1px solid #ddd; display: flex; align-items: flex-start; justify-content: flex-end; }
        .ken-left-inner { max-width: 520px; width: 100%; }
        .ken-quote { font-family: 'Bebas Neue', sans-serif; font-size: clamp(36px,4vw,56px); line-height: 1.05; color: #1e293b; border-right: 4px solid #f59e0b; padding-right: 32px; text-align: right; }
        .ken-quote em { font-style: normal; color: #f59e0b; }
        .ken-right { padding: clamp(48px,6vw,80px) clamp(24px,5vw,60px); display: flex; flex-direction: column; justify-content: center; gap: 20px; }
        .ken-eyebrow { font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: 4px; color: #f59e0b; display: block; }
        .ken-body { font-family: 'DM Sans', sans-serif; font-size: 16px; color: #6b7280; line-height: 1.8; max-width: 420px; }
        .btn-dark { display: inline-block; background: #111827; color: #f59e0b; font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 3px; padding: 14px 32px; border-radius: 999px; text-decoration: none; transition: background 0.2s; }
        .btn-dark:hover { background: #1e293b; }

        /* DIVIDER */
        .divider { background: #111827; padding: clamp(32px,5vw,48px) clamp(24px,5vw,60px); display: flex; align-items: center; gap: 24px; }
        .divider-line { flex: 1; height: 1px; background: #374151; }
        .divider-label { font-family: 'Bebas Neue', sans-serif; font-size: 14px; letter-spacing: 6px; color: #6b7280; white-space: nowrap; }

        /* FOOTER */
        footer { background: #0d1117; border-top: 1px solid #1f2937; padding: 40px clamp(24px,5vw,60px); display: flex; justify-content: space-between; align-items: center; }
        .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #f59e0b; letter-spacing: 3px; text-decoration: none; }
        .footer-copy { font-family: 'Space Mono', monospace; font-size: 10px; color: #374151; letter-spacing: 1px; }

        /* MOBILE */
        @media (max-width: 768px) {
          .up-nav { padding: 0 20px; }
          .pricing-grid { grid-template-columns: 1fr; }
          .pricing-col-left { border-right: none; border-bottom: 1px solid #374151; }
          .light-section { grid-template-columns: 1fr; }
          .ken-left { justify-content: flex-start; border-right: none; border-bottom: 1px solid #ddd; }
          .ken-quote { border-right: none; border-left: 4px solid #f59e0b; padding-right: 0; padding-left: 24px; text-align: left; }
          footer { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <nav className="up-nav">
        <a href="/" className="up-logo">ARNO<span>BOT.</span></a>
        <a href="/bot" className="up-back">← TERUG NAAR DE BOT</a>
      </nav>

      {/* ARNOLIVE */}
      <section className="dark-section">
        <div className="product-header">
          <span className="up-eyebrow">Begeleiding</span>
          <h1 className="up-h1">ARNOLIVE</h1>
          <p className="up-lead">Maandelijks 45 minuten. Cut the crap. Korte en krachtige feedback.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-col pricing-col-left">
            <div className="plan-name">3 SESSIES</div>
            <div className="plan-period">Kwartaal</div>
            <div className="plan-price">
              <span className="plan-cur">€</span>
              <span className="plan-amt">900</span>
            </div>
            <div className="plan-sep" />
            <ul className="plan-features">
              <li>Maandelijks 45 minuten met Arno</li>
              <li>Sessies via Proton Meet</li>
              <li>Direct feedback op jouw situatie</li>
              <li>Geen voorbereiding nodig</li>
              <li>Solo, met co-founder of heel het team</li>
            </ul>
            <a href="mailto:arnolive@arno.bot?subject=ARNOLIVE%20Kwartaal%20aanmelding" className="btn-outline">STARTEN →</a>
          </div>
          <div className="pricing-col pricing-col-featured">
            <span className="plan-badge">Meest gekozen</span>
            <div className="plan-name">12 SESSIES</div>
            <div className="plan-period">Jaar</div>
            <div className="plan-price">
              <span className="plan-cur">€</span>
              <span className="plan-amt">2.700</span>
            </div>
            <div className="plan-sep" />
            <ul className="plan-features">
              <li>Maandelijks 45 minuten met Arno</li>
              <li>Sessies via Proton Meet</li>
              <li>Continuïteit: Arno kent jouw context</li>
              <li>Grip op het hele jaar</li>
              <li>Één kwartaal gratis</li>
            </ul>
            <a href="mailto:arnolive@arno.bot?subject=ARNOLIVE%20Jaar%20aanmelding" className="btn-amber">STARTEN →</a>
          </div>
        </div>
      </section>

      {/* KENNISMAKING — light section, zelfde patroon als homepage */}
      <section className="light-section">
        <div className="ken-left">
          <div className="ken-left-inner">
            <div className="ken-quote">
              Eerst kijken<br />
              of je het<br />
              <em>aandurft?</em>
            </div>
          </div>
        </div>
        <div className="ken-right">
          <span className="ken-eyebrow">Gratis · 30 minuten</span>
          <p className="ken-body">Plan een kennismakingsgesprek met Arno. Geen pitch, geen druk. Gewoon kijken of het klikt en wat voor jou werkt.</p>
          <div>
            <a href="https://calendly.com/arnodiepeveen/30min" target="_blank" rel="noopener noreferrer" className="btn-dark">
              PLAN EEN GESPREK →
            </a>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="divider">
        <div className="divider-line" />
        <span className="divider-label">NEXT LEVEL</span>
        <div className="divider-line" />
      </div>

      {/* ARNOPRIME */}
      <section className="dark-section">
        <div className="product-header">
          <span className="up-eyebrow">Interventie</span>
          <h1 className="up-h1">ARNOPRIME</h1>
          <p className="up-lead">Anderhalve dag op de hei. Jouw MT. Eén plan. Aligned.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-col pricing-col-left">
            <div className="plan-name">1 OF 2 PERSONEN</div>
            <div className="plan-period">Solo / Co-founders</div>
            <div className="plan-price">
              <span className="plan-cur">€</span>
              <span className="plan-amt">7.900</span>
            </div>
            <div className="plan-sep" />
            <ul className="plan-features">
              <li>1½ dag pressure cooker sessie buiten kantoor</li>
              <li>Voorbereiding op basis van jullie Sales Canvas</li>
              <li>Vertrek met een plan dat staat als een huis</li>
              <li>Optioneel: extra dag mogelijk</li>
              <li>All-in, overal in Europa</li>
            </ul>
            <a href="mailto:arnoprime@arno.bot?subject=ARNOPRIME%20Solo%20aanmelding" className="btn-outline">NEEM CONTACT OP →</a>
          </div>
          <div className="pricing-col pricing-col-featured">
            <span className="plan-badge">Management Team</span>
            <div className="plan-name">MT-SESSIE</div>
            <div className="plan-period">Heel het MT</div>
            <div className="plan-price">
              <span className="plan-cur">€</span>
              <span className="plan-amt">11.900</span>
            </div>
            <div className="plan-sep" />
            <ul className="plan-features">
              <li>1½ dag pressure cooker sessie buiten kantoor</li>
              <li>Voorgesprek met ieder MT-lid apart</li>
              <li>Output: strak plan. Ready. Set. Go.</li>
              <li>Optioneel: extra dag mogelijk</li>
              <li>All-in, overal in Europa</li>
            </ul>
            <a href="mailto:arnoprime@arno.bot?subject=ARNOPRIME%20MT-sessie%20aanmelding" className="btn-amber">NEEM CONTACT OP →</a>
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
