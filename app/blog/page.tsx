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

export default async function BlogPage() {
  const posts = await getPosts()

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
        .nav-active { color: #f0ede6 !important; }
        .nav-cta { color: #EE7700 !important; }

        /* ── BLOG HEADER ── */
        .blog-header {
          padding-top: 80px;
          background: #0a0a0a;
        }
        .blog-header-inner {
          padding: 60px 60px 0;
          border-bottom: 3px solid #EE7700;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 40px;
        }
        .blog-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(72px, 10vw, 140px);
          line-height: 0.88;
          color: #f0ede6;
          letter-spacing: -2px;
        }
        .blog-title span { color: #EE7700; }
        .blog-meta {
          text-align: right;
          padding-bottom: 8px;
        }
        .blog-count {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 48px; color: #EE7700; display: block; line-height: 1;
        }
        .blog-count-label {
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #444;
        }

        /* ── BRUTALE INTRO BALK ── */
        .blog-intro {
          background: #EE7700;
          padding: 20px 60px;
          display: flex;
          align-items: center;
          gap: 40px;
          overflow: hidden;
        }
        .blog-intro-item {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 3px;
          color: #0a0a0a; white-space: nowrap;
        }
        .blog-intro-dot {
          width: 6px; height: 6px; background: #0a0a0a;
          border-radius: 50%; flex-shrink: 0;
        }

        /* ── POSTS GRID ── */
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          padding: 2px;
        }
        @media (max-width: 1024px) { .posts-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .posts-grid { grid-template-columns: repeat(2, 1fr); } }

        .post-card {
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 28px; background: #111;
          text-decoration: none; color: #f0ede6;
          border-bottom: 2px solid transparent;
          transition: border-color 0.2s, background 0.2s;
          min-height: 200px;
        }
        .post-card:hover { border-bottom-color: #EE7700; background: #161616; }
        .post-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px; color: #2a2a2a; transition: color 0.2s; margin-bottom: 10px;
        }
        .post-card:hover .post-num { color: #EE7700; }
        .post-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; line-height: 1.0; flex: 1;
        }
        .post-date {
          margin-top: 16px; font-size: 10px;
          letter-spacing: 2px; text-transform: uppercase; color: #333;
        }

        /* ── FOOTER ── */
        footer {
          background: #050505; padding: 40px 60px;
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid #111; margin-top: 2px;
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
          <h1 className="blog-title">ARNO<br /><span>BLOG(T)</span></h1>
          <div className="blog-meta">
            <span className="blog-count">{posts.length}</span>
            <span className="blog-count-label">Posts — Since 2007</span>
          </div>
        </div>
      </div>

      <div className="blog-intro">
        {['Provocerend', '•', 'Ongefilterd', '•', 'Anti-middelmatigheid', '•', 'Sales', '•', 'Excellentie', '•', 'Lisboa', '•', 'Priceless', '•', 'Provocerend', '•', 'Ongefilterd', '•', 'Anti-middelmatigheid', '•', 'Sales', '•', 'Excellentie'].map((item, i) => (
          item === '•'
            ? <div key={i} className="blog-intro-dot" />
            : <span key={i} className="blog-intro-item">{item}</span>
        ))}
      </div>

      <div className="posts-grid">
        {posts.map((post, i) => (
          <Link key={post._id} href={`/blog/${post.slug.current}`} className="post-card">
            <div>
              <div className="post-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="post-title">{decodeHtml(post.title)}</div>
            </div>
            <div className="post-date">
              {new Date(post.publishedAt).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })}
            </div>
          </Link>
        ))}
      </div>

      <footer>
        <span className="footer-logo">Royal Dutch Sales</span>
        <span className="footer-copy">© Since 2007 — CC BY-ND 4.0</span>
      </footer>
    </>
  )
}
