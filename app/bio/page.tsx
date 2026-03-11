import Link from 'next/link'

export default function BioPage() {
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
          font-size: 22px; letter-spacing: 3px;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: #f0ede6; }
        .nav-active { color: #EE7700 !important; }
        .nav-cta { color: #EE7700 !important; }

        .bio-hero {
          padding-top: 80px;
          min-height: 50vh;
          display: flex;
          align-items: flex-end;
          background: #111;
          border-bottom: 1px solid #1e1e1e;
        }
        .bio-hero-inner {
          padding: 80px 60px 60px;
          border-bottom: 3px solid #EE7700;
          max-width: 900px;
        }
        .bio-label {
          font-size: 11px; letter-spacing: 4px; text-transform: uppercase;
          color: #EE7700; font-family: 'Space Mono', monospace; margin-bottom: 24px; display: block;
        }
        .bio-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(64px, 10vw, 120px);
          line-height: 0.9; margin-bottom: 32px;
        }
        .bio-title-arno { color: #EE7700; }
        .bio-title-diepeveen { color: #f0ede6; }
        .bio-subtitle {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 24px; font-weight: 300; color: #666; letter-spacing: 1px;
        }

        .bio-body {
          max-width: 900px;
          margin: 0 auto;
          padding: 80px 60px 120px;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 80px;
        }
        .bio-sidebar {}
        .bio-sidebar-item { margin-bottom: 40px; }
        .bio-sidebar-label {
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          color: #444; font-family: 'Space Mono', monospace; margin-bottom: 8px;
        }
        .bio-sidebar-value {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 20px; font-weight: 600; color: #f0ede6;
        }
        .bio-text p {
          font-size: 13px; line-height: 2.2; color: #888; margin-bottom: 28px;
        }
        .bio-text strong { color: #f0ede6; font-weight: 700; }
        .bio-text em { color: #EE7700; font-style: normal; }

        footer {
          background: #050505; padding: 40px 60px;
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid #111;
        }
        .footer-logo {
          font-family: 'Bebas Neue', sans-serif; font-size: 24px;
          color: #EE7700; letter-spacing: 3px;
        }
        .footer-copy { font-size: 10px; color: #333; }
      `}</style>

      <nav className="site-nav">
        <div className="nav-links">
          <Link href="/">HOME</Link>
          <Link href="/blog">BLOG</Link>
          <Link href="/bio" className="nav-active">BIO</Link>
          <Link href="/canvas">CANVAS</Link>
          <Link href="/spar" className="nav-cta">SPAR</Link>
          <a href="/#subscribe" className="nav-cta">SUBSCRIBE</a>
        </div>
      </nav>

      <div className="bio-hero">
        <div className="bio-hero-inner">
<h1 className="bio-title"><span className="bio-title-arno">ARNO</span><br /><span className="bio-title-diepeveen">DIEPEVEEN.</span></h1>
          <p className="bio-subtitle">Verkoper. Schrijver. Provocateur. Lisboa.</p>
        </div>
      </div>

      <div className="bio-body">
        <div className="bio-sidebar">
          <div className="bio-sidebar-item">
            <div className="bio-sidebar-label">Woonplaats</div>
            <div className="bio-sidebar-value">Lisboa, Portugal 🇵🇹</div>
          </div>
          <div className="bio-sidebar-item">
            <div className="bio-sidebar-label">Actief sinds</div>
            <div className="bio-sidebar-value">2007</div>
          </div>
          <div className="bio-sidebar-item">
            <div className="bio-sidebar-label">Contact</div>
            <div className="bio-sidebar-value">
              <a href="mailto:hq@royaldutchsales.com" style={{color:'#EE7700',textDecoration:'none',fontSize:'14px'}}>
                hq@royaldutchsales.com
              </a>
            </div>
          </div>
        </div>
        <div className="bio-text">
          <p>
            <strong>Arno Diepeveen</strong> schrijft over verkoop zoals anderen over voetbal schrijven — met passie, mening en zonder respect voor heilige huisjes.
          </p>
          <p>
            Royal Dutch Sales begon in 2007 als een manier om te zeggen wat anderen niet durfden. Sindsdien zijn er honderden posts verschenen — over acquisitie, excellentie, middelmaat, en alles wat daartussen zit.
          </p>
          <p>
            <em>Anti-middelmatigheid</em> is geen slogan. Het is een levenshouding. Voor wie het aankan.
          </p>
          <p>
            Arno woont en werkt vanuit <strong>Lisboa, Portugal</strong> — ver van de Nederlandse polderconsensus, dichtbij de zon en de Atlantische Oceaan.
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
