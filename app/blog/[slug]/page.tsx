import { client } from '@/sanity/client'
import { PortableText } from '@portabletext/react'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'

const builder = imageUrlBuilder(client)
function urlFor(source: unknown) {
  return builder.image(source as Parameters<typeof builder.image>[0])
}

interface Post {
  title: string
  publishedAt: string
  body: unknown[]
  coverImage: unknown
}

async function getPost(slug: string): Promise<Post> {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      title, publishedAt, body, coverImage
    }`,
    { slug }
  )
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  return (
    <>
      <style>{`
        .body-content p {
          margin-bottom: 24px;
          line-height: 2;
          color: #aaa;
        }
        .back-link {
          color: #555;
          text-decoration: none;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .back-link:hover { color: #e8ff00; }
      `}</style>

      <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
        <main style={{
          padding: '60px',
          fontFamily: 'monospace',
          color: '#f0ede6',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          <Link href="/" className="back-link">← Terug</Link>

          {post.coverImage && (
            <img
              src={urlFor(post.coverImage).width(800).url()}
              alt={post.title}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                margin: '40px 0'
              }}
            />
          )}

          <h1 style={{
            fontFamily: 'sans-serif',
            fontSize: '60px',
            fontWeight: '900',
            lineHeight: '1',
            margin: '40px 0 16px',
            color: '#f0ede6'
          }}>
            {post.title}
          </h1>

          <p style={{
            color: '#555',
            fontSize: '11px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '60px',
            paddingBottom: '40px',
            borderBottom: '1px solid #1a1a1a'
          }}>
            {new Date(post.publishedAt).toLocaleDateString('nl-NL', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>

          <div className="body-content">
            <PortableText value={post.body} />
          </div>
        </main>
      </div>
    </>
  )
}