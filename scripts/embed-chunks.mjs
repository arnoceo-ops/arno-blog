/**
 * Eenmalig script: chunked chief_sales_updates.txt en slaat embeddings op in Supabase.
 * Uitvoeren: node scripts/embed-chunks.mjs
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname_file = dirname(fileURLToPath(import.meta.url))
const blogUrls = JSON.parse(
  readFileSync(join(__dirname_file, '..', 'data', 'blog-urls.json'), 'utf-8')
)

function getBlogUrl(title) {
  // Exacte match
  if (blogUrls[title]) return blogUrls[title]
  // Case-insensitive fallback
  const lower = title.toLowerCase()
  for (const [key, url] of Object.entries(blogUrls)) {
    if (key.toLowerCase() === lower) return url
  }
  return null
}

const __dirname = dirname(fileURLToPath(import.meta.url))


// Laad .env.local handmatig
const envPath = join(__dirname, '..', '.env.local')
const envVars = readFileSync(envPath, 'utf-8')
for (const line of envVars.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '')
}

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const CHUNK_SIZE = 400
const OVERLAP = 80
const BATCH_SIZE = 8
const RATE_LIMIT_DELAY_MS = 21000 // 3 RPM = 1 request per 20s

const DATE_HEADER = /^(?:(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}|\d{1,2}\s+(?:januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\s+\d{4})\s*$/i

/**
 * Splits de tekst in blogs op basis van datum-headers.
 * Elke blog krijgt: { source: "TITEL (Month DD, YYYY)", text: "..." }
 */
function parseBlogs(text) {
  const lines = text.split('\n')
  const blogs = []
  let currentDate = null
  let currentTitle = null
  let currentLines = []
  let waitingForTitle = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (DATE_HEADER.test(trimmed)) {
      // Sla vorige blog op
      if (currentTitle && currentLines.length > 0) {
        const url = getBlogUrl(currentTitle)
        blogs.push({
          source: `${currentTitle} (${currentDate})`,
          url,
          text: currentLines.join('\n').trim(),
        })
      }
      currentDate = trimmed
      currentTitle = null
      currentLines = []
      waitingForTitle = true
      continue
    }

    if (waitingForTitle && trimmed.length > 0) {
      // Eerste niet-lege regel na datum = titel
      // Strip emoji's voor een schone titel
      currentTitle = trimmed.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim()
      waitingForTitle = false
      currentLines.push(line)
      continue
    }

    currentLines.push(line)
  }

  // Laatste blog
  if (currentTitle && currentLines.length > 0) {
    const url = getBlogUrl(currentTitle)
    blogs.push({
      source: `${currentTitle} (${currentDate})`,
      url,
      text: currentLines.join('\n').trim(),
    })
  }

  return blogs
}

function makeChunksForBlog(blog) {
  const words = blog.text.split(/\s+/).filter(Boolean)
  const chunks = []
  let i = 0
  while (i < words.length) {
    chunks.push({
      content: words.slice(i, i + CHUNK_SIZE).join(' '),
      source: blog.source,
      url: blog.url || null,
    })
    i += CHUNK_SIZE - OVERLAP
  }
  return chunks
}

async function embedBatch(texts) {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: texts, model: 'voyage-3' }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Voyage API error: ${err}`)
  }
  const json = await res.json()
  return json.data.map(d => d.embedding)
}

async function main() {
  const filePath = join(__dirname, '..', 'data', 'chief_sales_updates.txt')
  const text = readFileSync(filePath, 'utf-8')

  const blogs = parseBlogs(text)
  console.log(`${blogs.length} blogs gevonden:`)
  blogs.forEach(b => console.log(`  - ${b.source}`))

  const allChunks = blogs.flatMap(makeChunksForBlog)
  console.log(`\n${allChunks.length} chunks aangemaakt. Begin met embedden...`)

  const { error: deleteError } = await supabase.from('blog_chunks').delete().neq('id', 0)
  if (deleteError) throw new Error(`Delete error: ${deleteError.message}`)
  console.log('Bestaande chunks gewist.')

  let inserted = 0
  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE)
    const embeddings = await embedBatch(batch.map(c => c.content))

    const rows = batch.map((chunk, j) => ({
      content: chunk.content,
      source: chunk.source,
      url: chunk.url,
      embedding: embeddings[j],
    }))
    const { error } = await supabase.from('blog_chunks').insert(rows)
    if (error) throw new Error(`Insert error: ${error.message}`)

    inserted += batch.length
    process.stdout.write(`\r${inserted}/${allChunks.length} chunks opgeslagen...`)

    if (i + BATCH_SIZE < allChunks.length) {
      await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS))
    }
  }

  console.log('\nKlaar!')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
