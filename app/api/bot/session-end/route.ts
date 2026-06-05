import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { getRelevantChunks } from '@/lib/rag'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const { sessionId, messages } = await req.json()
  if (!sessionId || !messages?.length) return NextResponse.json({ ok: true })

  // Auth via Clerk cookie, of fallback via bestaande log-rij (voor sendBeacon die geen cookies meestuurt)
  let userId: string | null = null
  try {
    const clerkAuth = await auth()
    userId = clerkAuth.userId
  } catch {}

  if (!userId) {
    const { data: logRow } = await supabase
      .from('arnobot_rds_logs')
      .select('user_id')
      .eq('session_id', sessionId)
      .not('user_id', 'is', null)
      .limit(1)
      .single()
    userId = logRow?.user_id ?? null
  }

  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const title = (messages.find((m: { role: string }) => m.role === 'user')?.content as string)?.slice(0, 100) || 'Gesprek'
  const messageCount = messages.filter((m: { role: string }) => m.role === 'user').length

  const conversationText = messages
    .map((m: { role: string; content: string }) =>
      `${m.role === 'user' ? 'GEBRUIKER' : 'ARNO'}: ${m.content}`
    )
    .join('\n\n')

  // Synthese genereren
  let summary = ''
  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      system: 'Je bent Arno Diepeveen. Oprichter Royal Dutch Sales. Direct, ongefilterd, geen bullshit. Geen corporate taal. Geen accenten op woorden voor nadruk.',
      messages: [{
        role: 'user',
        content: `Schrijf een terugblik op dit gesprek in maximaal 2-3 zinnen. Wat was de kern en wat is de ene concrete takeaway. Geen inleiding, geen opsomming — direct de essentie, in eerste persoon als Arno.\n\n${conversationText}`
      }]
    })
    summary = response.content[0].type === 'text' ? response.content[0].text : ''
  } catch (e) {
    console.error('Synthesis error:', e)
  }

  // Blog-suggesties: eerst inline geciteerde blogs uit de berichten halen
  type BlogSuggestion = { title: string; url: string }
  const blogSuggestions: BlogSuggestion[] = []

  const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
  const seenUrls = new Set<string>()
  for (const msg of messages as { role: string; content: string }[]) {
    if (msg.role !== 'arno') continue
    let match
    const re = new RegExp(mdLinkRegex.source, 'g')
    while ((match = re.exec(msg.content)) !== null) {
      const [, text, url] = match
      if (url.includes('arno.blog') && !seenUrls.has(url)) {
        seenUrls.add(url)
        const title = text.length > 60 ? text.slice(0, 57) + '...' : text
        blogSuggestions.push({ title, url })
        if (blogSuggestions.length >= 3) break
      }
    }
    if (blogSuggestions.length >= 3) break
  }

  // Fallback: RAG op de synthese als er geen inline links zijn
  if (blogSuggestions.length === 0 && summary) {
    try {
      const chunks = await getRelevantChunks(summary, 10)
      for (const c of chunks) {
        if (c.url && c.source && c.url.includes('arno.blog') && !seenUrls.has(c.url)) {
          seenUrls.add(c.url)
          blogSuggestions.push({
            title: c.source.replace(/\s*\([^)]+\)\s*$/, ''),
            url: c.url,
          })
          if (blogSuggestions.length >= 2) break
        }
      }
    } catch (e) {
      console.error('Blog suggestions error:', e)
    }
  }

  await supabase
    .from('arnobot_blog_sessions')
    .upsert({
      user_id: userId,
      session_id: sessionId,
      title,
      summary,
      message_count: messageCount,
      blog_suggestions: blogSuggestions,
    }, { onConflict: 'session_id' })

  return NextResponse.json({ ok: true, summary, blogs: blogSuggestions })
}
