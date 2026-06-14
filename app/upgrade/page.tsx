export const metadata = {
  title: 'ArnoBot: Upgrade',
}

export default function UpgradePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111827; color: #f1f5f9; font-family: 'Space Mono', monospace; font-weight: 400; }

        .up-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(17,24,39,0.95); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 clamp(20px,5vw,48px); height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .up-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 3px; color: #f1f5f9; text-decoration: none; }
        .up-logo span { color: #f59e0b; }
        .up-back { font-family: 'Bebas Neue', sans-serif; font-size: 15px; letter-spacing: 3px; color: #9ca3af; text-decoration: none; transition: color 0.2s; }
        .up-back:hover { color: #f1f5f9; }

        .up-wrap { max-width: 1100px; margin: 0 auto; padding: clamp(48px,8vw,80px) clamp(20px,5vw,48px); }

        .up-eyebrow { font-family: 'Space Mono', monospace; font-weight: 400; font-size: 13px; letter-spacing: 4px; color: #f59e0b; display: block; margin-bottom: 8px; }
        .up-h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px,7vw,80px); line-height: 1; letter-spacing: 3px; color: #f1f5f9; margin-bottom: 16px; }
        .up-h2 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px,6vw,64px); line-height: 1; letter-spacing: 3px; color: #f1f5f9; margin-bottom: 16px; }
        .up-lead { font-family: 'Space Mono', monospace; font-size: 15px; line-height: 1.9; color: #9ca3af; max-width: 540px; margin-bottom: 48px; }

        .up-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 2px; }

        .up-card { background: #1f2937; padding: clamp(24px,4vw,40px); display: flex; flex-direction: column; }
        .up-card-featured { background: #1e293b; border-top: 3px solid #f59e0b; }

        .up-badge { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #f59e0b; display: block; margin-bottom: 12px; }
        .up-plan { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 3px; color: #f1f5f9; margin-bottom: 4px; }
        .up-period { font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: 4px; color: #6b7280; margin-bottom: 24px; }

        .up-price { display: flex; align-items: baseline; gap: 6px; margin-bottom: 28px; }
        .up-cur { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #6b7280; line-height: 1; }
        .up-amt { font-family: 'Bebas Neue', sans-serif; font-size: 72px; line-height: 1; color: #f1f5f9; letter-spacing: -2px; }

        .up-sep { height: 1px; background: #374151; margin-bottom: 28px; }

        .up-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px; margin-bottom: 36px; flex: 1; }
        .up-list li { font-family: 'Space Mono', monospace; font-size: 14px; color: #9ca3af; line-height: 1.7; display: flex; gap: 12px; align-items: flex-start; }
        .up-list li::before { content: '→'; color: #f59e0b; flex-shrink: 0; }

        .up-btn { display: block; text-align: center; text-decoration: none; font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 3px; padding: 12px 36px; border-radius: 999px; transition: background 0.2s, border-color 0.2s, color 0.2s; }
        .up-btn-primary { background: #f59e0b; color: #111827; }
        .up-btn-primary:hover { background: #d97706; }
        .up-btn-outline { border: 1px solid #374151; color: #9ca3af; }
        .up-btn-outline:hover { border-color: #6b7280; color: #f1f5f9; }

        .up-contact { background: #1f2937; padding: clamp(24px,4vw,40px); display: flex; align-items: center; justify-content: space-between; gap: 32px; }
        .up-contact-eyebrow { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #f59e0b; display: block; margin-bottom: 10px; }
        .up-contact-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 2px; color: #f1f5f9; margin-bottom: 8px; }
        .up-contact-body { font-family: 'Space Mono', monospace; font-size: 14px; color: #9ca3af; line-height: 1.8; max-width: 400px; }

        .up-divider { display: flex; align-items: center; gap: 24px; padding: clamp(40px,6vw,64px) clamp(20px,5vw,48px); max-width: 1100px; margin: 0 auto; }
        .up-divider-line { flex: 1; height: 1px; background: #374151; }
        .up-divider-label { font-family: 'Bebas Neue', sans-serif; font-size: 14px; letter-spacing: 6px; color: #6b7280; white-space: nowrap; }

        .up-section-border { border-top: 3px solid #f59e0b; }

        @media (max-width: 680px) {
          .up-grid { grid-template-columns: 1fr; }
          .up-contact { flex-direction: column; align-items: flex-start; }
          .up-contact .up-btn-primary { width: 100%; }
        }
      `}</style>

      <nav className="up-nav">
        <a href="/" className="up-logo">ARNO<span>BOT.</span></a>
        <a href="/bot" className="up-back">← TERUG NAAR DE BOT</a>
      </nav>

      {/* ARNOLIVE */}
      <div className="up-section-border">
        <div className="up-wrap">
          <span className="up-eyebrow">BEGELEIDING</span>
          <h1 className="up-h1">ARNOLIVE</h1>
          <p className="up-lead">Maandelijks 45 minuten. Cut the crap. Korte en krachtige feedback.</p>

          <div className="up-grid">
            <div className="up-card">
              <div className="up-plan">3 SESSIES</div>
              <div className="up-period">KWARTAAL</div>
              <div className="up-price">
                <span className="up-cur">€</span>
                <span className="up-amt">900</span>
              </div>
              <div className="up-sep" />
              <ul className="up-list">
                <li>Maandelijks 45 minuten met Arno</li>
                <li>Sessies via Proton Meet</li>
                <li>Direct feedback op jouw situatie</li>
                <li>Geen voorbereiding nodig</li>
                <li>Solo, met co-founder of heel het team</li>
              </ul>
              <a href="mailto:arnolive@salescanvas.app?subject=ARNOLIVE%20Kwartaal%20aanmelding" className="up-btn up-btn-outline">STARTEN →</a>
            </div>

            <div className="up-card up-card-featured">
              <span className="up-badge">MEEST GEKOZEN</span>
              <div className="up-plan">12 SESSIES</div>
              <div className="up-period">JAAR</div>
              <div className="up-price">
                <span className="up-cur">€</span>
                <span className="up-amt">2.700</span>
              </div>
              <div className="up-sep" />
              <ul className="up-list">
                <li>Maandelijks 45 minuten met Arno</li>
                <li>Sessies via Proton Meet</li>
                <li>Continuïteit: Arno kent jouw context</li>
                <li>Grip op het hele jaar</li>
                <li>Één kwartaal gratis</li>
              </ul>
              <a href="mailto:arnolive@salescanvas.app?subject=ARNOLIVE%20Jaar%20aanmelding" className="up-btn up-btn-primary">STARTEN →</a>
            </div>
          </div>

          <div className="up-contact">
            <div>
              <span className="up-contact-eyebrow">GRATIS · 30 MINUTEN</span>
              <div className="up-contact-title">Eerst kijken of je het aandurft?</div>
              <p className="up-contact-body">Plan een kennismakingsgesprek met Arno. Geen pitch, geen druk. Gewoon kijken of het klikt en wat voor jou werkt.</p>
            </div>
            <a href="https://calendly.com/arnodiepeveen/30min" target="_blank" rel="noopener noreferrer" className="up-btn up-btn-primary" style={{whiteSpace:'nowrap', flexShrink:0}}>
              PLAN EEN GESPREK →
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="up-divider">
        <div className="up-divider-line" />
        <span className="up-divider-label">NEXT LEVEL</span>
        <div className="up-divider-line" />
      </div>

      {/* ARNOPRIME */}
      <div className="up-section-border">
        <div className="up-wrap">
          <span className="up-eyebrow">INTERVENTIE</span>
          <h2 className="up-h2">ARNOPRIME</h2>
          <p className="up-lead">Anderhalve dag op de hei. Jouw MT. Eén plan. Aligned.</p>

          <div className="up-grid">
            <div className="up-card">
              <div className="up-plan">1 OF 2 PERSONEN</div>
              <div className="up-period">SOLO / CO-FOUNDERS</div>
              <div className="up-price">
                <span className="up-cur">€</span>
                <span className="up-amt">7.900</span>
              </div>
              <div className="up-sep" />
              <ul className="up-list">
                <li>1½ dag pressure cooker sessie buiten kantoor</li>
                <li>Voorbereiding op basis van jullie Sales Canvas</li>
                <li>Vertrek met een plan dat staat als een huis</li>
                <li>Optioneel: extra dag mogelijk</li>
                <li>All-in, overal in Europa</li>
              </ul>
              <a href="mailto:arnoprime@salescanvas.app?subject=ARNOPRIME%20Solo%20aanmelding" className="up-btn up-btn-outline">NEEM CONTACT OP →</a>
            </div>

            <div className="up-card up-card-featured">
              <span className="up-badge">MANAGEMENT TEAM</span>
              <div className="up-plan">MT-SESSIE</div>
              <div className="up-period">HEEL HET MT</div>
              <div className="up-price">
                <span className="up-cur">€</span>
                <span className="up-amt">11.900</span>
              </div>
              <div className="up-sep" />
              <ul className="up-list">
                <li>1½ dag pressure cooker sessie buiten kantoor</li>
                <li>Voorgesprek met ieder MT-lid apart</li>
                <li>Output: strak plan. Ready. Set. Go.</li>
                <li>Optioneel: extra dag mogelijk</li>
                <li>All-in, overal in Europa</li>
              </ul>
              <a href="mailto:arnoprime@salescanvas.app?subject=ARNOPRIME%20MT-sessie%20aanmelding" className="up-btn up-btn-primary">NEEM CONTACT OP →</a>
            </div>
          </div>
        </div>
      </div>

      <footer style={{background:'#0d1117', padding:'32px clamp(20px,5vw,48px)', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #1f2937'}}>
        <a href="/" style={{fontFamily:"'Bebas Neue', sans-serif", fontSize:22, letterSpacing:3, color:'#f59e0b', textDecoration:'none'}}>ARNOBOT.</a>
        <span style={{fontFamily:"'Space Mono', monospace", fontSize:10, color:'#374151', letterSpacing:1}}>© 2025 · arno.bot</span>
      </footer>
    </>
  )
}
