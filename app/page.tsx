import { client } from '@/sanity/client'
import Link from 'next/link'

interface Post {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
}

function decodeHtml(str: string): string {
  return (str || '')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

async function getPosts(): Promise<Post[]> {
  const posts = await client.fetch(`*[_type == "post"] | order(publishedAt desc) { _id, title, slug, publishedAt }`)
  const seen = new Set<string>()
  return posts.filter((p: Post) => {
    const key = decodeHtml(p.title || '').toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default async function Home() {
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
        .nav-cta { color: #EE7700 !important; }

        /* ── HERO ── */
        .hero {
          position: relative; width: 100%; height: 100vh;
          min-height: 600px; overflow: hidden; display: flex; align-items: flex-end;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background-image: url('/hero.jpg');
          background-size: cover; background-position: center; background-color: #1a1a1a;
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(105deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.6) 45%, rgba(10,10,10,0.15) 100%);
        }
        .hero-content { position: relative; z-index: 2; padding: 0 0 80px 60px; }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(80px, 12vw, 160px);
          line-height: 0.88; letter-spacing: -2px; color: #f0ede6;
        }
        .hero-title span { color: #EE7700; }
        .hero-tagline {
          position: absolute; bottom: 80px; right: 60px; z-index: 2;
          text-align: right; display: none;
        }
        .hero-tagline p {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(28px, 3vw, 44px);
          letter-spacing: 4px; text-transform: uppercase;
          color: rgba(240,237,230,0.6); line-height: 1.4;
        }
        .hero-tagline p span { color: rgba(238,119,0,0.9); }
        @media (min-width: 768px) { .hero-tagline { display: block; } }

        /* ── CANVAS ── */
        .canvas-section {
          background: #111; display: grid; grid-template-columns: 1fr 1fr;
          border-top: 1px solid #1e1e1e;
        }
        .canvas-left {
          padding: 80px 60px; border-right: 1px solid #1e1e1e; display: flex; align-items: center;
        }
        .canvas-quote {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 4vw, 64px);
          line-height: 1.05; color: #f0ede6;
          border-left: 4px solid #EE7700; padding-left: 32px;
        }
        .canvas-quote em { font-style: normal; color: #EE7700; }
        .canvas-right {
          padding: 80px 60px; display: flex; flex-direction: column;
          justify-content: center; gap: 24px;
        }
        .canvas-label {
          font-family: 'Bebas Neue', sans-serif; font-size: 13px;
          letter-spacing: 5px; color: #EE7700; text-transform: uppercase;
        }
        .canvas-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 4vw, 64px);
          line-height: 1.05; color: #f0ede6; letter-spacing: 1px;
        }
        .canvas-body {
          font-size: 15px; line-height: 2; color: #888; max-width: 420px;
        }
        .canvas-link {
          display: inline-flex; align-items: center; gap: 12px;
          color: #EE7700; text-decoration: none;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 3px; text-transform: uppercase;
          margin-top: 8px; transition: gap 0.2s;
        }
        .canvas-link:hover { gap: 20px; }

        /* ── MANIFESTO ── */
        .manifesto {
          background: #f0ede6; color: #0a0a0a; padding: 100px 60px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
        }
        .manifesto-quote {
          font-family: 'Bebas Neue', sans-serif; font-size: 64px; line-height: 1; letter-spacing: 1px;
        }
        .manifesto-quote em { font-style: normal; color: #EE7700; }
        .manifesto-body { color: #333; line-height: 2; font-size: 13px; }
        .manifesto-body p + p { margin-top: 20px; }
        .manifesto-sig { margin-top: 40px; font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 4px; }

        /* ── SUBSCRIBE ── */
        .subscribe-section {
          background: #EE7700; color: #0a0a0a; padding: 80px 60px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
        }
        .subscribe-form { display: flex; flex-direction: column; gap: 12px; max-width: 360px; }
        .subscribe-input {
          background: rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.15);
          color: #0a0a0a; font-family: 'Space Mono', monospace;
          font-size: 13px; padding: 14px 18px; outline: none; width: 100%;
        }
        .subscribe-btn {
          background: #0a0a0a; color: #EE7700;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px; letter-spacing: 3px; text-transform: uppercase;
          padding: 14px 18px; border: none; cursor: pointer; width: 100%;
          transition: background 0.2s;
        }
        .subscribe-btn:hover { background: #1a1a1a; }
        .subscribe-text { }
        .subscribe-text h3 {
          font-family: 'Bebas Neue', sans-serif; font-size: 32px;
          letter-spacing: 2px; margin-bottom: 20px; line-height: 1;
        }
        .subscribe-text p {
          font-size: 13px; line-height: 2; color: rgba(0,0,0,0.7);
        }
        .subscribe-text em { font-style: normal; font-weight: 700; color: #0a0a0a; }

        /* ── FOOTER ── */
        footer {
          background: #050505; padding: 60px;
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; border-top: 1px solid #111;
        }
        .footer-logo {
          font-family: 'Bebas Neue', sans-serif; font-size: 40px;
          color: #EE7700; letter-spacing: 3px; display: block; margin-bottom: 12px;
        }
        .footer-desc { font-size: 11px; color: #555; line-height: 2; }
        .footer-col h4 {
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #555; margin-bottom: 20px;
        }
        .footer-links { list-style: none; }
        .footer-links li { margin-bottom: 10px; }
        .footer-links a { color: #444; text-decoration: none; font-size: 12px; transition: color 0.1s; }
        .footer-links a:hover { color: #EE7700; }
        .footer-bottom {
          grid-column: span 3; border-top: 1px solid #111; padding-top: 32px;
          display: flex; justify-content: space-between; color: #333; font-size: 10px;
        }
      `}</style>

      {/* NAV */}
      <nav className="site-nav">
        <div className="nav-links">
          <Link href="/blog">BLOG</Link>
          <Link href="/bio">BIO</Link>
          <Link href="/canvas">CANVAS</Link>
          <a href="#subscribe" className="nav-cta">SUBSCRIBE</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-tagline">
          <p>Provocerend. Suggestief.</p>
          <p>Ongefilterd. <span>Priceless.</span></p>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">ROYAL<br />DUTCH<br /><span>SALES.</span></h1>
        </div>
      </section>

      {/* RDS CANVAS */}
      <section className="canvas-section">
        <div className="canvas-left">
          <div className="canvas-quote">
            "Vision without action<br />
            is a <em>daydream.</em><br />
            Action without vision<br />
            is a <em>nightmare.</em>"
          </div>
        </div>
        <div className="canvas-right">
          <span className="canvas-label">Nieuw</span>
          <h2 className="canvas-title">RDS 🚀<br /><span style={{color:'#EE7700'}}>Canvas</span></h2>
          <p className="canvas-body">
            De meeste verkopers weten niet waarom ze winnen. En al helemaal niet waarom ze verliezen. Het RDS Canvas legt het bloot. Geen excuses, geen flaterende spiegel. Goed verkopen is geen talent — het is een systeem. Brutaal eerlijk, zonder ruimte voor zelfbedrog.
          </p>
          <Link href="/canvas" className="canvas-link">Go Go Canvas →</Link>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="manifesto">
        <div className="manifesto-quote">
          "Excellence is not an act — it's a <em>habit.</em> Unfortunately, so is <em>failure.</em>"
        </div>
        <div>
          <div className="manifesto-body">
            <p>Royal Dutch Sales dient geen enkel commercieel doel. Het is wars van alles wat iedereen al doet.</p>
            <p>Geen thought leadership-bingo, geen LinkedIn-pap. Wel directe, ruwe, soms pijnlijke waarheden over verkoop, mensen en excellentie.</p>
            <p>Voor de een een arrogant betwetertje. Voor de ander een bron van rijkmakende ideeën.</p>
          </div>
          <div className="manifesto-sig">— Arno Diepeveen, Lisboa</div>
        </div>
      </section>

      {/* SUBSCRIBE */}
      <section className="subscribe-section" id="subscribe">
        <div className="subscribe-form">
          <input className="subscribe-input" type="text" placeholder="Naam" />
          <input className="subscribe-input" type="email" placeholder="Email" />
          <button className="subscribe-btn">GO!</button>
        </div>
        <div className="subscribe-text">
          <h3>Chief Sales Updates</h3>
          <p>
            Abonneer je op de Chief Sales Updates, <em>formerly known as Royal Dutch Updates.</em> Bijna iedere vrijdag, bij het wakker worden: food for thought and food for action. Het grootste risico is dat je meer gaat verkopen. Als je er iets mee doet dan, hè? Het is niks waard of miljoenen. Hoe dan ook, <em>priceless.</em>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div>
          <span className="footer-logo">Royal Dutch Sales</span>
          <p className="footer-desc">Provocerend. Suggestief. Ongefilterd. Priceless.<br /><br />Rua Presidente Arriaga, Lisboa 🇵🇹</p>
        </div>
        <div className="footer-col">
          <h4>Navigatie</h4>
          <ul className="footer-links">
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/bio">Bio</Link></li>
            <li><Link href="/canvas">Canvas</Link></li>
            <li><a href="#subscribe">Subscribe</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul className="footer-links">
            <li><a href="mailto:hq@royaldutchsales.com">hq@royaldutchsales.com</a></li>
            <li><a href="#subscribe">Subscribe</a></li>
            <li><a href="#">Privacy</a></li>
          </ul>
        </div>
        <div className="footer-bottom">
          <span>© Royal Dutch Sales — Since 2007</span>
          <span>CC BY-ND 4.0</span>
        </div>
      </footer>
    </>
  )
}
