import Link from 'next/link'
import { client } from '@/sanity/client'
import { PortableText } from '@portabletext/react'

async function getBioPage() {
  return await client.fetch(`*[_type == "bioPage"][0]`)
}

export default async function BioPage() {
  const bio = await getBioPage()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Barlow:wght@400;700&family=Barlow+Condensed:wght@300;600;900&display=swap');
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

        .bio-hero { padding-top: 80px; background: #0a0a0a; }
        .bio-hero-inner {
          padding: 80px 60px 60px;
          border-bottom: 3px solid #EE7700;
          display: flex; justify-content: space-between; align-items: flex-end;
        }
        .bio-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(64px, 10vw, 120px);
          line-height: 0.9;
        }
        .bio-title-arno { color: #EE7700; display: block; }
        .bio-title-diepeveen { color: #f0ede6; display: block; }

        .bio-tagline { text-align: right; padding-bottom: 8px; max-width: 420px; }
        .bio-tagline-title {
          font-family: 'Barlow', sans-serif;
          font-size: 26px; font-weight: 700; color: #f0ede6;
          display: block; margin-bottom: 8px; letter-spacing: 0.5px;
        }
        .bio-tagline-sub {
          font-family: 'Space Mono', monospace;
          font-size: 15px; line-height: 1.9; color: #aaa; display: block;
        }

        .bio-body {
          max-width: 960px; margin: 0 auto;
          padding: 80px 60px 120px;
          display: flex; flex-direction: column; gap: 60px;
        }
        .bio-video { width: 800px; max-width: 100%; margin: 0 auto; }
        .bio-text { width: 800px; max-width: 100%; margin: 0 auto; }
        .bio-text p {
          font-size: 15px; line-height: 1.875; color: #888; margin-bottom: 28px;
        }
        .bio-text strong { color: #f0ede6; font-weight: 700; }
        .bio-text em { color: #EE7700; font-style: normal; }

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
          <Link href="/bio" className="nav-active">BIO</Link>
          <Link href="/canvas">CANVAS</Link>
          <Link href="/spar" className="nav-cta">SPAR</Link>
          <a href="/#subscribe" className="nav-cta">SUBSCRIBE</a>
        </div>
      </nav>

      <div className="bio-hero">
        <div className="bio-hero-inner">
          <h1 className="bio-title">
            <span className="bio-title-arno">ARNO</span>
            <span className="bio-title-diepeveen">DIEPEVEEN.</span>
          </h1>
          <div className="bio-tagline">
            <span className="bio-tagline-title">{bio?.taglineTitle}</span>
            <span className="bio-tagline-sub">{bio?.taglineSub}</span>
          </div>
        </div>
      </div>

      <div className="bio-body">
        <div className="bio-video">
          <div style={{position:'relative',overflow:'hidden',paddingBottom:'56.25%'}}>
            <iframe
              src="https://cdn.jwplayer.com/players/e737ObvZ-NOqL4ECN.html"
              width="100%" height="100%"
              frameBorder="0"
              scrolling="no"
              title="ABOUT ARNO"
              style={{position:'absolute',top:0,left:0}}
              allowFullScreen
            />
          </div>
        </div>
        <div className="bio-text">
          {bio?.body && <PortableText value={bio.body} />}
        </div>
      </div>

      <footer>
        <span className="footer-logo">Royal Dutch Sales</span>
        <span className="footer-copy">© Since 2007 — CC BY-ND 4.0</span>
      </footer>
    </>
  )
}
