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

        /* ── CANVAS (light sections) ── */
        .canvas-section {
          background: #f0ede6; display: grid; grid-template-columns: 1fr 1fr;
          border-top: 3px solid #EE7700;
        }
        .canvas-left {
          padding: 80px 60px; border-right: 1px solid #ddd; display: flex;
          align-items: flex-start; justify-content: flex-end;
        }
        .canvas-left-inner { max-width: 480px; width: 100%; }
        .canvas-quote {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 4vw, 64px);
          line-height: 1.05; color: #0a0a0a;
          border-right: 4px solid #EE7700; padding-right: 32px;
          text-align: right;
        }
        .canvas-quote em { font-style: normal; color: #EE7700; }
        .canvas-right {
          padding: 80px 60px; display: flex; flex-direction: column;
          justify-content: flex-start; gap: 24px;
        }
        .canvas-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 4vw, 64px);
          line-height: 1.05; color: #0a0a0a; letter-spacing: 1px;
        }
        .canvas-body { font-size: 15px; line-height: 2; color: #555; max-width: 420px; }
        .canvas-link {
          display: block; color: #EE7700; text-decoration: none;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px; letter-spacing: 3px; text-transform: uppercase;
          margin-top: 16px; background: #0a0a0a;
          padding: 14px 18px; border: none; border-radius: 999px;
          width: 380px; max-width: 100%; text-align: center; transition: background 0.2s;
        }
        .canvas-link:hover { background: #1a1a1a; }

        /* ── SUBSCRIBE (dark sections) ── */
        .subscribe-section {
          background: #111; color: #f0ede6;
          display: grid; grid-template-columns: 1fr 1fr;
          border-top: 3px solid #EE7700;
        }
        .subscribe-text-col {
          padding: 80px 60px; border-right: 1px solid #333;
          display: flex; align-items: flex-start; justify-content: flex-end;
        }
        .subscribe-text-inner { max-width: 480px; width: 100%; display: flex; flex-direction: column; gap: 16px; text-align: right; }
        .subscribe-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 4vw, 64px);
          line-height: 1.05; letter-spacing: 1px; margin-bottom: 4px;
        }
        .subscribe-title .black { color: #f0ede6; }
        .subscribe-title .orange { color: #EE7700; }
        .subscribe-body { font-size: 15px; line-height: 2; color: #888; margin-bottom: 8px; }
        .subscribe-body em { font-style: normal; font-weight: 700; color: #f0ede6; }
        .subscribe-btn {
          display: block; text-decoration: none; text-align: center; align-self: flex-end;
          background: #EE7700; color: #0a0a0a;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px; letter-spacing: 3px; text-transform: uppercase;
          padding: 14px 18px; width: 380px; max-width: 100%; transition: background 0.2s; margin-top: 8px;
          border-radius: 999px;
        }
        .subscribe-btn:hover { background: #ff8800; }
        .subscribe-btn-dark {
          display: block; text-decoration: none; text-align: center;
          background: #1a1a1a; color: #888;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px; letter-spacing: 3px; text-transform: uppercase;
          padding: 14px 18px; width: 380px; max-width: 100%; transition: background 0.2s; margin-top: 8px;
          border-radius: 999px;
        }
        .subscribe-btn-dark:hover { background: #222; color: #f0ede6; }

        /* ── PRICING BADGE ── */
        .pricing-badge {
          display: inline-block; font-size: 10px; letter-spacing: 3px;
          text-transform: uppercase; color: #EE7700;
          font-family: 'Space Mono', monospace;
          border: 1px solid #EE7700; padding: 4px 12px;
          align-self: flex-start; border-radius: 999px; margin-bottom: 8px;
        }
        .pricing-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(60px, 7vw, 100px);
          line-height: 0.9; color: #f0ede6; letter-spacing: -1px;
        }
        .pricing-price span { font-size: clamp(20px, 2.5vw, 32px); color: #555; letter-spacing: 0; }

        /* ── FEATURE LIST ── */
        .feature-item {
          display: flex; align-items: baseline; gap: 16px;
          padding: 20px 0; border-bottom: 1px solid #ddd;
        }
        .feature-item:last-child { border-bottom: none; }
        .feature-arrow { color: #EE7700; font-family: 'Bebas Neue', sans-serif; font-size: 20px; flex-shrink: 0; }
        .feature-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 22px; font-weight: 600;
          color: #0a0a0a; letter-spacing: 0.5px;
          text-transform: uppercase; line-height: 1.2;
        }
        .feature-text small {
          display: block; font-family: 'Space Mono', monospace;
          font-size: 11px; letter-spacing: 2px; color: #888;
          font-weight: 400; text-transform: none; margin-top: 4px;
        }

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

          .canvas-section { grid-template-columns: 1fr; }
          .canvas-left { padding: 48px 24px; border-right: none; border-bottom: 1px solid #ddd; justify-content: flex-start; }
          .canvas-quote { border-right: none; border-left: 4px solid #EE7700; padding-right: 0; padding-left: 24px; text-align: left; }
          .canvas-right { padding: 40px 24px; }
          .canvas-link { width: 100%; }

          .subscribe-section { grid-template-columns: 1fr; }
          .subscribe-text-col { padding: 48px 24px; border-right: none; border-bottom: 1px solid #333; justify-content: flex-start; }
          .subscribe-text-inner { text-align: left; }
          .subscribe-btn { align-self: stretch; width: 100%; }
          .subscribe-btn-dark { width: 100%; }

          footer { padding: 32px 24px; flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav className="site-nav">
        <div className="nav-links">
          <Link href="/">HOME</Link>
          <Link href="/bio">ARNO</Link>
          <a href="https://www.royaldutchsales.com/arnobot" className="nav-active">BOT</a>
          <a href="https://salescanvas.app" target="_blank" rel="noopener noreferrer">CANVAS</a>
          <a href="https://arno.blog/subscribe" target="_blank" rel="noopener noreferrer" className="nav-cta">SUBSCRIBE</a>
        </div>
      </nav>

      {/* INTRO */}
      <section className="subscribe-section" style={{background: '#0a0a0a', paddingTop: '80px'}}>
        {/* LEFT: foto — vult de grid-cel zonder minHeight te pushen */}
        <div style={{overflow:'hidden', position:'relative', minHeight:'360px'}}>
          <img src="/cyborg.jpg" alt="ArnoBot" style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 25%', display:'block'}} />
        </div>
        {/* RIGHT: propositie */}
        <div className="canvas-right" style={{background: '#0a0a0a'}}>
          <div style={{maxWidth:'480px'}}>
            <p style={{fontSize:'15px', letterSpacing:'4px', textTransform:'uppercase', color:'#EE7700', fontFamily:"'Space Mono', monospace", marginBottom:'16px'}}>ArnoBot Unlimited</p>
            <h2 style={{fontFamily:"'Barlow Condensed', sans-serif", fontSize:'clamp(28px, 3vw, 44px)', fontWeight:600, color:'#f0ede6', lineHeight:1.15, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'20px'}}>
              Één advies kan je<br />goud opleveren.<br /><span style={{color:'#EE7700'}}>€97 per maand.</span>
            </h2>
            <p className="subscribe-body">
              Dat is minder dan een kwartier consultancy. Maar je krijgt er geen kwartier voor terug — je krijgt er onbeperkt toegang voor. 19 jaar sales-expertise, direct beschikbaar. Elke vraag. Elke dag.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING + FEATURES */}
      <section className="canvas-section">
        <div className="canvas-left">
          <div className="canvas-left-inner" style={{display:'flex', flexDirection:'column'}}>

            {/* PER MAAND */}
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'14px', paddingBottom:'48px', borderBottom:'1px solid #ddd'}}>
              <span style={{fontSize:'13px', letterSpacing:'5px', textTransform:'uppercase', color:'#EE7700', fontFamily:"'Bebas Neue', sans-serif"}}>Per maand</span>
              <div style={{fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(64px, 7vw, 104px)', lineHeight:0.85, color:'#444', letterSpacing:'-2px'}}>
                <span style={{fontSize:'0.42em', color:'#bbb', verticalAlign:'text-bottom', letterSpacing:0}}>€ </span>97
              </div>
              <a href="https://royaldutchsales.com/arnobot?plan=monthly" style={{
                display:'inline-block', textDecoration:'none', textAlign:'center',
                background:'#EE7700', color:'#0a0a0a',
                fontFamily:"'Bebas Neue', sans-serif",
                fontSize:'15px', letterSpacing:'3px',
                padding:'9px 22px', borderRadius:'999px',
                transition:'opacity 0.2s'
              }}>GO →</a>
              <span style={{fontSize:'10px', color:'#aaa', letterSpacing:'1px', fontFamily:"'Space Mono', monospace"}}>Niet goed na 8 dagen? Geld terug.</span>
            </div>

            {/* PER JAAR */}
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'14px', paddingTop:'48px'}}>
              <span style={{fontSize:'13px', letterSpacing:'5px', textTransform:'uppercase', color:'#EE7700', fontFamily:"'Bebas Neue', sans-serif"}}>Per jaar</span>
              <div style={{fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(64px, 7vw, 104px)', lineHeight:0.85, color:'#444', letterSpacing:'-2px'}}>
                <span style={{fontSize:'0.42em', color:'#bbb', verticalAlign:'text-bottom', letterSpacing:0}}>€ </span>777
              </div>
              <a href="https://royaldutchsales.com/arnobot?plan=yearly" style={{
                display:'inline-block', textDecoration:'none', textAlign:'center',
                background:'#EE7700', color:'#0a0a0a',
                fontFamily:"'Bebas Neue', sans-serif",
                fontSize:'15px', letterSpacing:'3px',
                padding:'9px 22px', borderRadius:'999px',
                transition:'opacity 0.2s'
              }}>GO →</a>
              <span style={{fontSize:'10px', color:'#aaa', letterSpacing:'1px', fontFamily:"'Space Mono', monospace"}}>Niet goed na 8 dagen? Geld terug.</span>
            </div>

          </div>
        </div>
        <div className="canvas-right">
          <div className="feature-item">
            <span className="feature-arrow">→</span>
            <span className="feature-text">Onbeperkt vragen stellen<small>Geen limiet. Geen wachttijd.</small></span>
          </div>
          <div className="feature-item">
            <span className="feature-arrow">→</span>
            <span className="feature-text">Sessiehistorie<small>Al je gesprekken bewaard en doorzoekbaar.</small></span>
          </div>
          <div className="feature-item">
            <span className="feature-arrow">→</span>
            <span className="feature-text">PDF export<small>Exporteer elk gesprek als document.</small></span>
          </div>
          <div className="feature-item">
            <span className="feature-arrow">→</span>
            <span className="feature-text">Onthoudt jouw sessies<small>Werkt op basis van jouw persoonlijke profiel.</small></span>
          </div>
          <div className="feature-item">
            <span className="feature-arrow">→</span>
            <span className="feature-text">Verwijzingen naar blogs<small>Elk antwoord onderbouwd met Arno's eigen artikelen.</small></span>
          </div>
          <div className="feature-item">
            <span className="feature-arrow">→</span>
            <span className="feature-text">Overleg met Arno<small>Niet de bot maar Arno in persoon. Binnenkort beschikbaar →</small></span>
          </div>
        </div>
      </section>

      {/* COMING SOON — light, dimmed */}
      <section className="canvas-section" style={{opacity: 0.6}}>
        <div className="canvas-left">
          <div className="canvas-left-inner">
            <div style={{fontFamily:"'Bebas Neue', sans-serif", fontSize:'14px', letterSpacing:'6px', color:'#aaa', border:'2px dashed #ccc', padding:'8px 20px', display:'inline-block'}}>
              BINNENKORT
            </div>
          </div>
        </div>
        <div className="canvas-right">
          <h2 className="canvas-title">ARNO <span style={{color:'#EE7700'}}>LIVE.</span></h2>
          <p className="canvas-body">
            Niet alleen de bot. Arno zelf. Persoonlijke online consultancy over jouw specifieke situatie. Voor als je er echt iets mee wil doen.
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
