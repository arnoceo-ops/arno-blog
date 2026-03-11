import Link from 'next/link'

export default function CanvasPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@300;600;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
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
        .nav-active { color: #EE7700 !important; }
        .nav-cta { color: #EE7700 !important; }

        .canvas-hero {
          padding-top: 80px;
          background: #0a0a0a;
        }
        .canvas-hero-inner {
          padding: 80px 60px 60px;
          border-bottom: 3px solid #EE7700;
        }
        .canvas-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(64px, 10vw, 120px);
          line-height: 0.9; color: #f0ede6; margin-bottom: 32px;
        }
        .canvas-title span { color: #EE7700; }
        .canvas-subtitle {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 24px; font-weight: 300; color: #666; letter-spacing: 1px;
        }

        .canvas-coming {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 120px 60px; text-align: center;
          border-bottom: 1px solid #1e1e1e;
        }
        .coming-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px; letter-spacing: 6px; color: #EE7700; margin-bottom: 32px;
        }
        .coming-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 6vw, 80px);
          color: #f0ede6; margin-bottom: 24px; line-height: 1;
        }
        .coming-body {
          font-size: 13px; line-height: 2; color: #555;
          max-width: 500px; margin-bottom: 48px;
        }
        .coming-back {
          color: #EE7700; text-decoration: none;
          font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
          font-family: 'Space Mono', monospace; transition: opacity 0.2s;
        }
        .coming-back:hover { opacity: 0.7; }

        footer {
          background: #050505; padding: 40px 60px;
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid #111;
        }
        .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #EE7700; letter-spacing: 3px; }
        .footer-copy { font-size: 10px; color: #333; }
      `}</style>

      <nav className="site-nav">
        <div className="nav-links">
          <Link href="/">HOME</Link>
          <Link href="/blog">BLOG</Link>
          <Link href="/bio">BIO</Link>
          <Link href="/canvas" className="nav-active">CANVAS</Link>
          <Link href="/spar" className="nav-cta">SPAR</Link>
          <a href="/#subscribe" className="nav-cta">SUBSCRIBE</a>
        </div>
      </nav>

      <div className="canvas-hero">
        <div className="canvas-hero-inner">
          <h1 className="canvas-title">RDS<br /><span>Canvas.</span></h1>
          <p className="canvas-subtitle">Framework. Strategie. Geen excuses.</p>
        </div>
      </div>

      <div className="canvas-coming">
        <p className="coming-label">Coming Soon</p>
        <h2 className="coming-title">Wordt gebouwd.<br />Wordt brutaal.</h2>
        <p className="coming-body">
          Het RDS Canvas is in ontwikkeling. Een framework dat de bullshit eruit haalt en de kern blootlegt. Meld je aan voor de nieuwsbrief en je bent de eerste die het weet.
        </p>
        <a href="/#subscribe" className="coming-back">Houd me op de hoogte →</a>
      </div>

      <footer>
        <span className="footer-logo">Royal Dutch Sales</span>
        <span className="footer-copy">© Since 2007 — CC BY-ND 4.0</span>
      </footer>
    </>
  )
}
