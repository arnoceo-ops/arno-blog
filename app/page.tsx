 
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
        .post-row {
          display: grid;
          grid-template-columns: 48px 1fr auto;
          gap: 32px;
          align-items: center;
          padding: 24px;
          background: #141414;
          text-decoration: none;
          color: #f0ede6;
          border-left: 2px solid transparent;
          transition: border-color 0.2s;
        }
        .post-row:hover {
          border-left-color: #e8ff00;
        }
        .post-num {
          color: #222;
          font-size: 28px;
          font-weight: 900;
          transition: color 0.2s;
        }
        .post-row:hover .post-num {
          color: #e8ff00;
        }
      `}</style>
      <main style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        padding: '80px 60px',
        fontFamily: 'monospace',
        color: '#f0ede6'
      }}>
        <h1 style={{
          fontFamily: 'sans-serif',
          fontSize: '80px',
          fontWeight: '900',
          color: '#e8ff00',
          letterSpacing: '4px',
          marginBottom: '8px',
          lineHeight: '1'
        }}>
          arno.blog
        </h1>
        <p style={{
          color: '#555',
          fontSize: '12px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '60px'
        }}>
          Provocerend. Suggestief. Ongefilterd.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {posts.map((post, i) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug.current}`}
              className="post-row"
            >
              <span className="post-num">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: '20px', fontWeight: '600' }}>
                {post.title}
              </span>
              <span style={{ fontSize: '11px', color: '#555', letterSpacing: '2px' }}>
                {new Date(post.publishedAt).toLocaleDateString('nl-NL', {
                  month: 'short', year: 'numeric'
                })}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}