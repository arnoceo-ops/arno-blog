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
  const posts = await client.fetch(
    `*[_type == "post"] | order(publishedAt desc) {
      _id, title, slug, publishedAt
    }`
  )
  const seen = new Set<string>()
  return posts.filter((p: Post) => {
    const key = decodeHtml(p.title || '').toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default async function Home() {
  const allPosts = await getPosts()
  const posts = allPosts.slice(0, 9)

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

        /* ── NAV ── */
        .site-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,10,10,0.9);
          backdrop-filter: blur(12px);
        }
        .nav-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px;
          letter-spacing: 3px;
          color: #EE7700;
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .nav-links a {
          color: #555;
          text-decoration: none;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: #f0ede6; }
        .nav-cta {
          color: #EE7700 !important;
        }

        /* ── HERO ── */
        .hero {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 600px;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background-image: url('/hero.jpg');
          background-size: cover;
          background-position: center;
          background-color: #1a1a1a;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(10,10,10,0.85) 0%,
            rgba(10,10,10,0.5) 50%,
            rgba(10,10,10,0.1) 100%
          );
        }
        .hero-content {
          position: relative;
          z-index: 2;
          padding: 0 60px 80px;
          max-width: 700px;
        }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(80px, 12vw, 160px);
          line-height: 0.88;
          letter-spacing: -2px;
          color: #f0ede6;
          margin-bottom: 0;
        }
        .hero-title span {
          color: #EE7700;
        }


        /* ── POSTS GRID ── */
        .posts-section {
          padding: 80px 60px 100px;
        }
        .posts-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 48px;
          border-top: 1px solid #1e1e1e;
          padding-top: 32px;
        }
        .posts-header h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 64px;
          letter-spacing: 2px;
        }
        .posts-header a {
          color: #EE7700;
          text-decoration: none;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: opacity 0.2s;
        }
        .posts-header a:hover { opacity: 0.7; }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }
        .post-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 32px;
          background: #141414;
          text-decoration: none;
          color: #f0ede6;
          border-left: 3px solid transparent;
          transition: border-color 0.2s, background 0.2s;
          min-height: 260px;
        }
        .post-card:hover {
          border-left-color: #EE7700;
          background: #1a1a1a;
        }
        .post-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          color: #2a2a2a;
          line-height: 1;
          transition: color 0.2s;
          margin-bottom: 12px;
        }
        .post-card:hover .post-num { color: #EE7700; }
        .post-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 42px;
          line-height: 1.0;
          letter-spacing: 0.5px;
          flex: 1;
        }
        .post-date {
          margin-top: 20px;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #444;
        }

        /* ── MANIFESTO ── */
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

        /* ── SUBSCRIBE ── */
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

        /* ── FOOTER ── */
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
      <nav className="site-nav">
        <span className="nav-logo">Royal Dutch Sales</span>
        <div className="nav-links">
          {['Blog', 'Bio', 'Tools', 'Contact'].map(item => (
            <a key={item} href="#">{item}</a>
          ))}
          <a href="#subscribe" className="nav-cta">Subscribe →</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">
            ROYAL<br />
            DUTCH<br />
            <span>SALES.</span>
          </h1>
        </div>
      </section>


      {/* POSTS GRID */}
      <section id="blog" className="posts-section">
        <div className="posts-header">
          <h2>Laatste Posts</h2>
          <Link href="/blog">Alle posts →</Link>
        </div>
        <div className="posts-grid">
          {posts.map((post, i) => (
            <Link key={post._id} href={`/blog/${post.slug.current}`} className="post-card">
              <div>
                <div className="post-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="post-title">{decodeHtml(post.title)}</div>
              </div>
              <div className="post-date">
                {new Date(post.publishedAt).toLocaleDateString('nl-NL', {
                  month: 'short', year: 'numeric'
                })}
              </div>
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
