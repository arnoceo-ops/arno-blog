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
        .nav-active { color: #EE7700 !important; }
        .nav-cta { color: #EE7700 !important; }

        .blog-hero {
          padding-top: 80px;
          background: #0a0a0a;
          border-bottom: 1px solid #1e1e1e;
          padding-bottom: 60px;
        }
        .blog-hero-inner {
          padding: 60px 60px 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .blog-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(64px, 10vw, 120px);
          line-height: 0.9;
          color: #f0ede6;
        }
        .blog-title span { color: #EE7700; }
        .blog-count {
          font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
          color: #444; font-family: 'Space Mono', monospace;
          padding-bottom: 16px;
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          padding: 2px;
        }
        @media (max-width: 1024px) {
          .posts-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .posts-grid { grid-template-columns: repeat(2, 1fr); }
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
          min-height: 220px;
        }
        .post-card:hover {
          border-left-color: #EE7700;
          background: #1a1a1a;
        }
        .post-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; color: #2a2a2a;
          transition: color 0.2s; margin-bottom: 12px;
        }
        .post-card:hover .post-num { color: #EE7700; }
        .post-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px; line-height: 1.0; flex: 1;
        }
        .post-date {
          margin-top: 16px; font-size: 10px;
          letter-spacing: 2px; text-transform: uppercase; color: #444;
        }

        footer {
          background: #050505; padding: 40px 60px;
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid #111; margin-top: 2px;
        }
        .footer-logo {
          font-family: 'Bebas Neue', sans-serif; font-size: 24px;
          color: #EE7700; letter-spacing: 3px;
        }
        .footer-copy { font-size: 10px; color: #333; }
      `}</style>

      <nav className="site-nav">
        <div className="nav-links">
          <Link href="/blog" className="nav-active">BLOG</Link>
          <Link href="/bio">BIO</Link>
          <Link href="/canvas">CANVAS</Link>
          <a href="/#subscribe" className="nav-cta">SUBSCRIBE</a>
        </div>
      </nav>

      <div className="blog-hero">
        <div className="blog-hero-inner">
          <h1 className="blog-title">Arno.<br /><span>Blog(t).</span></h1>
          <span className="blog-count">{posts.length} posts — since 2007</span>
        </div>
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

      <footer>
        <span className="footer-logo">Royal Dutch Sales</span>
        <span className="footer-copy">© Since 2007 — CC BY-ND 4.0</span>
      </footer>
    </>
  )
}
