import { client } from '@/sanity/client'
import Link from 'next/link'
import ArnoChatbox from './ArnoChatbox'

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

export default async function BlogPage() {
  const posts = await getPosts()

  // Groepeer per jaar
  const byYear: Record<string, Post[]> = {}
  for (const post of posts) {
    const year = new Date(post.publishedAt).getFullYear().toString()
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(post)
  }
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

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
          color: #888; text-decoration: none; font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 3px; transition: color 0.2s;
        }
        .nav-links a:hover { color: #f0ede6; }
        .nav-active { color: #f0ede6 !important; }
        .nav-cta { color: #EE7700 !important; }

        /* ── HEADER ── */
        .blog-header {
          padding-top: 80px; background: #0a0a0a;
        }
        .blog-header-inner {
          padding: 60px 60px 40px;
          border-bottom: 3px solid #EE7700;
          display: flex; justify-content: space-between; align-items: flex-end;
        }
        .blog-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(72px, 10vw, 140px);
          line-height: 0.88; color: #f0ede6;
        }
        .blog-title-arno {
          display: block;
          letter-spacing: 0.21em;
        }
        .blog-title-blogt {
          display: block;
          color: #EE7700;
          letter-spacing: -0.02em;
        }
        .blog-meta { text-align: right; padding-bottom: 8px; }
        .blog-count { font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: #EE7700; display: block; line-height: 1; }
        .blog-count-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #444; }

        /* ── ARCHIEF ── */
        .archive { padding: 0 60px 80px; }

        .year-block { margin-top: 0; }

        .year-divider {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          gap: 24px;
          padding: 48px 0 0;
          margin-bottom: 0;
        }
        .year-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 100px; line-height: 1;
          color: #1a1a1a; letter-spacing: -2px;
          user-select: none;
        }
        .year-line { height: 1px; background: #1e1e1e; }

        /* Post rij */
        .post-row {
          display: grid;
          grid-template-columns: 56px 1fr auto;
          align-items: baseline;
          gap: 24px;
          padding: 20px 0;
          border-bottom: 1px solid #141414;
          text-decoration: none;
          color: #f0ede6;
          transition: background 0.15s;
          margin: 0 -60px;
          padding-left: 60px;
          padding-right: 60px;
        }
        .post-row:hover {
          background: #EE7700;
          color: #0a0a0a;
        }
        .post-row:hover .post-row-num { color: rgba(0,0,0,0.25); }
        .post-row:hover .post-row-date { color: rgba(0,0,0,0.5); }

        .post-row-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px; color: #2a2a2a;
          transition: color 0.15s;
        }
        .post-row-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(22px, 2.5vw, 34px);
          line-height: 1; letter-spacing: 0.5px;
        }
        .post-row-date {
          font-size: 10px; letter-spacing: 2px;
          text-transform: uppercase; color: #444;
          white-space: nowrap; transition: color 0.15s;
        }

        /* ── CHATBOX ── */
        .chat-section {
          background: #0a0a0a; border-top: 3px solid #EE7700;
          padding: 80px 60px;
        }
        .chat-header {
          display: flex; align-items: baseline; gap: 24px; margin-bottom: 48px;
        }
        .chat-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 6vw, 80px);
          line-height: 0.9; color: #f0ede6;
        }
        .chat-title span { color: #EE7700; }
        .chat-sub {
          font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #444;
        }
        .chat-messages {
          min-height: 120px; margin-bottom: 24px;
          display: flex; flex-direction: column; gap: 24px;
        }
        .chat-msg-user {
          align-self: flex-end; max-width: 60%;
          background: #1a1a1a; padding: 16px 20px;
          font-size: 13px; line-height: 1.8; color: #f0ede6;
          border-left: 3px solid #EE7700;
        }
        .chat-msg-arno {
          align-self: flex-start; max-width: 75%;
          background: #111; padding: 20px 24px;
          font-size: 14px; line-height: 1.9; color: #ccc;
          border-left: 3px solid #333;
        }
        .chat-msg-arno strong { color: #EE7700; font-weight: normal; font-family: 'Bebas Neue', sans-serif; font-size: 12px; letter-spacing: 3px; display: block; margin-bottom: 8px; }
        .chat-loading {
          align-self: flex-start;
          font-size: 12px; letter-spacing: 3px; color: #444; text-transform: uppercase;
          padding: 16px 0;
        }
        .chat-input-row {
          display: flex; gap: 0;
        }
        .chat-input {
          flex: 1; background: #111; border: 1px solid #222; border-right: none;
          color: #f0ede6; font-family: 'Space Mono', monospace;
          font-size: 13px; padding: 16px 20px; outline: none;
        }
        .chat-input::placeholder { color: #444; }
        .chat-send {
          background: #EE7700; color: #0a0a0a;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 3px;
          padding: 16px 32px; border: none; cursor: pointer;
          transition: background 0.2s; white-space: nowrap;
        }
        .chat-send:hover { background: #ff8800; }
        .chat-send:disabled { background: #555; cursor: not-allowed; }
        .chat-starters {
          display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px;
        }
        .chat-starter {
          background: transparent; border: 1px solid #222;
          color: #555; font-family: 'Space Mono', monospace;
          font-size: 11px; padding: 8px 14px; cursor: pointer;
          transition: all 0.2s; text-align: left;
        }
        .chat-starter:hover { border-color: #EE7700; color: #EE7700; }

        /* ── FOOTER ── */
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
          <Link href="/blog" className="nav-active">BLOG</Link>
          <Link href="/bio">BIO</Link>
          <Link href="/canvas">CANVAS</Link>
          <a href="/#subscribe" className="nav-cta">SUBSCRIBE</a>
        </div>
      </nav>

      <div className="blog-header">
        <div className="blog-header-inner">
          <h1 className="blog-title"><span className="blog-title-arno">ARNO</span><span className="blog-title-blogt">BLOG(T)</span></h1>
          <div className="blog-meta">
            <span className="blog-count">{posts.length}</span>
            <span className="blog-count-label">Posts — Since 2007</span>
          </div>
        </div>
      </div>

      <div className="archive">
        {years.map((year) => {
          const yearPosts = byYear[year]
          return (
            <div key={year} className="year-block">
              <div className="year-divider">
                <span className="year-label">{year}</span>
                <div className="year-line" />
              </div>
              {yearPosts.map((post, i) => {
                const globalIdx = posts.findIndex(p => p._id === post._id)
                return (
                  <Link key={post._id} href={`/blog/${post.slug.current}`} className="post-row">
                    <span className="post-row-num">{String(globalIdx + 1).padStart(2, '0')}</span>
                    <span className="post-row-title">{decodeHtml(post.title)}</span>
                    <span className="post-row-date">
                      {new Date(post.publishedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                    </span>
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>

      <div className="chat-section">
        <ArnoChatbox />
      </div>

      <footer>
        <span className="footer-logo">Royal Dutch Sales</span>
        <span className="footer-copy">© Since 2007 — CC BY-ND 4.0</span>
      </footer>
    </>
  )
}
