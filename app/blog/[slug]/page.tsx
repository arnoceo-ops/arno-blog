import { client } from '@/sanity/client'
import Link from 'next/link'

interface Post {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
}

async function getPosts(): Promise<Post[]> {
  return client.fetch(
    `*[_type == "post"] | order(publishedAt desc) {
      _id, title, slug, publishedAt
    }`
  )
}

export default async function Home() {
  const posts = await getPosts()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@300;600;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0a;
          color: #f0ede6;
          font-family: 'Space Mono', monospace;
        }

        .ticker {
          background: #EE7700;
          color: #0a0a0a;
          padding: 12px 0;
          overflow: hidden;
          white-space: nowrap;
        }
        .ticker-inner {
          display: inline-flex;
          animation: scroll 25s linear infinite;
        }
        .ticker-item {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 3px;
          padding: 0 40px;
        }
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .post-card {
          display: grid;
          grid-template-columns: 48px 1fr auto;
          gap: 32px;
          align-items: center;
          padding: 24px;
          background: #141414;
          text-decoration: none;
          color: #f0ede6;
          border-left: 2px solid transparent;
          transition: border-color 0.2s, background 0.2s;
          margin-bottom: 2px;
        }
        .post-card:hover {
          border-left-color: #EE7700;
          background: #1a1a1a;
        }
        .post-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px;
          color: #222;
          transition: color 0.2s;
        }
        .post-card:hover .post-num { color: #EE7700; }
        .post-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 24px;
        }
        .post-date {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #555;
        }

        .manifesto {
          background: #f0ede6;
          color: #0a0a0a;
          padding: 100px 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .manifesto-quote {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 64px;
          line-height: 1;
          letter-spacing: 1px;
        }
        .manifesto-quote em {
          font-style: normal;
          color: #EE7700;
        }
        .manifesto-body {
          color: #333;
          line-height: 2;
          font-size: 13px;
        }
        .manifesto-body p + p { margin-top: 20px; }
        .manifesto-sig {
          margin-top: 40px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 4px;
        }

        .subscribe-section {
          background: #EE7700;
          color: #0a0a0a;
          padding: 100px 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .subscribe-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 80px;
          line-height: 0.9;
        }
        .subscribe-sub {
          margin-top: 16px;
          font-size: 13px;
          color: rgba(0,0,0,0.6);
        }
        .subscribe-input {
          background: rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.15);
          color: #0a0a0a;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          padding: 16px 20px;
          outline: none;
          width: 100%;
          margin-bottom: 12px;
        }
        .subscribe-btn {
          background: #0a0a0a;
          color: #EE7700;
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 18px;
          border: none;
          cursor: pointer;
          width: 100%;
        }
        .subscribe-btn:hover { background: #1a1a1a; }

        footer {
          background: #050505;
          padding: 60px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 40px;
          border-top: 1px solid #111;
        }
        .footer-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 40px;
          color: #EE7700;
          letter-spacing: 3px;
          display: block;
          margin-bottom: 12px;
        }
        .footer-desc {
          font-size: 11px;
          color: #555;
          line-height: 2;
        }
        .footer-col h4 {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 20px;
        }
        .footer-links { list-style: none; }
        .footer-links li { margin-bottom: 10px; }
        .footer-links a {
          color: #444;
          text-decoration: none;
          font-size: 12px;
          transition: color 0.1s;
        }
        .footer-links a:hover { color: #EE7700; }
        .footer-bottom {
          grid-column: span 3;
          border-top: 1px solid #111;
          padding-top: 32px;
          display: flex;
          justify-content: space-between;
          color: #333;
          font-size: 10px;
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '20px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #1e1e1e',
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(10px)',
        fontFamily: 'Space Mono, monospace'
      }}>
        <span style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '24px', letterSpacing: '3px', color: '#EE7700'
        }}>Royal Dutch Sales</span>
        <div style={{ display: 'flex', gap: '32px' }}>
          {['Blog', 'Bio', 'Tools', 'Contact'].map(item => (
            <a key={item} href="#" style={{
              color: '#555', textDecoration: 'none',
              fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
              transition: 'color 0.1s'
            }}>{item}</a>
          ))}
          <a href="#subscribe" style={{
            color: '#EE7700', textDecoration: 'none',
            fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase'
          }}>Subscribe →</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        paddingTop: '80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '50%', height: '100%',
          background: '#141414', zIndex: 0
        }} />

        <div style={{
          position: 'relative', zIndex: 1,
          padding: '80px 40px 80px 60px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center'
        }}>
          <p style={{
            fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase',
            color: '#EE7700', marginBottom: '24px'
          }}>Since 2007 — arno.blog</p>

          <h1 style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 'clamp(72px, 10vw, 130px)',
            lineHeight: '0.9', letterSpacing: '-2px',
            marginBottom: '40px', color: '#f0ede6'
          }}>
            Royal<br />Dutch<br /><span style={{ color: '#EE7700' }}>Sales.</span>
          </h1>

          <p style={{
            fontSize: '13px', lineHeight: '1.8', color: '#888',
            maxWidth: '380px', marginBottom: '48px'
          }}>
            Het bijtertje onder de nationale sales blogs.<br />
            <strong style={{ color: '#f0ede6' }}>Anti-middelmatigheid.</strong> Anti-bullshit.<br />
            Pro-resultaat. Voor wie het aankan.
          </p>

          <a href="#blog" style={{
            display: 'inline-block',
            background: '#EE7700', color: '#0a0a0a',
            textDecoration: 'none',
            fontFamily: 'Space Mono, monospace',
            fontWeight: 700, fontSize: '12px',
            letterSpacing: '2px', textTransform: 'uppercase',
            padding: '16px 32px'
          }}>Lees de laatste post →</a>
        </div>

        <div style={{
          position: 'relative', zIndex: 1,
          padding: '80px 60px 80px 40px',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
        }}>
          <div style={{ display: 'flex', gap: '48px' }}>
            {[['18+', 'Jaar actief'], ['100+', 'Posts'], ['0', 'Filters']].map(([num, label]) => (
              <div key={label}>
                <span style={{
                  fontFamily: 'Bebas Neue, sans-serif',
                  fontSize: '48px', color: '#f0ede6',
                  letterSpacing: '2px', display: 'block'
                }}>{num}</span>
                <span style={{
                  fontSize: '10px', letterSpacing: '3px',
                  textTransform: 'uppercase', color: '#555'
                }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-inner">
          {['PROVOCEREND', '✦', 'SUGGESTIEF', '✦', 'ONGEFILTERD', '✦', 'PRICELESS', '✦', 'ANTI-MIDDELMATIGHEID', '✦', 'ROYAL DUTCH SALES', '✦', 'LISBOA 🇵🇹', '✦',
            'PROVOCEREND', '✦', 'SUGGESTIEF', '✦', 'ONGEFILTERD', '✦', 'PRICELESS', '✦', 'ANTI-MIDDELMATIGHEID', '✦', 'ROYAL DUTCH SALES', '✦', 'LISBOA 🇵🇹', '✦'
          ].map((item, i) => (
            <span key={i} className="ticker-item">{item}</span>
          ))}
        </div>
      </div>

      {/* BLOG LIST */}
      <section id="blog" style={{ padding: '100px 60px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: '60px', borderTop: '1px solid #1e1e1e', paddingTop: '32px'
        }}>
          <h2 style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '64px', letterSpacing: '2px'
          }}>Posts</h2>
          <a href="#" style={{
            color: '#EE7700', textDecoration: 'none',
            fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase'
          }}>Alle posts →</a>
        </div>

        <div>
          {posts.map((post, i) => (
            <Link key={post._id} href={`/blog/${post.slug.current}`} className="post-card">
              <span className="post-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="post-title">{post.title}</span>
              <span className="post-date">
                {new Date(post.publishedAt).toLocaleDateString('nl-NL', {
                  month: 'short', year: 'numeric'
                })}
              </span>
            </Link>
          ))}
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
        <div>
          <h2 className="subscribe-title">Word wakker.<br />Abonneer.</h2>
          <p className="subscribe-sub">Geen spam. Geen middelmatigheid. Alleen nieuwe posts.</p>
        </div>
        <div>
          <input className="subscribe-input" type="email" placeholder="jouw@email.nl" />
          <button className="subscribe-btn">Stuur me de harde waarheid →</button>
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
            <li><a href="#">Blog</a></li>
            <li><a href="#">Bio</a></li>
            <li><a href="#">Tools</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul className="footer-links">
            <li><a href="#">hq@royaldutchsales.com</a></li>
            <li><a href="#">Subscribe</a></li>
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