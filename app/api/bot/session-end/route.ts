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
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { sessionId, messages } = await req.json()
  if (!sessionId || !messages?.length) return NextResponse.json({ ok: true })

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

  // Blog-suggesties op basis van synthese — alleen als synthese beschikbaar is
  type BlogSuggestion = { title: string; url: string }
  const blogSuggestions: BlogSuggestion[] = []
  if (summary) {
    try {
      const chunks = await getRelevantChunks(summary, 10)
      const seen = new Set<string>()
      for (const c of chunks) {
        if (c.url && c.source && c.url.includes('arno.blog') && !seen.has(c.url)) {
          seen.add(c.url)
          blogSuggestions.push({
            title: c.source.replace(/\s*\([^)]+\)\s*$/, ''),
            url: c.url,
          })
          if (blogSuggestions.length === 2) break
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
