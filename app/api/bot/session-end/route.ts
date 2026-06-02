import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

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

  let summary = ''
  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: 'Je bent Arno Diepeveen. Oprichter Royal Dutch Sales. Direct, ongefilterd, geen bullshit. Geen corporate taal. Geen accenten op woorden voor nadruk.',
      messages: [{
        role: 'user',
        content: `Schrijf een terugblik op dit coachingsgesprek in 2-3 alinea's. Wat werd er besproken, wat waren de kernpunten, en wat is de belangrijkste takeaway. Schrijf in eerste persoon, vanuit mijn perspectief als Arno. Geen opsommingen — lopende tekst.\n\n${conversationText}`
      }]
    })
    summary = response.content[0].type === 'text' ? response.content[0].text : ''
  } catch (e) {
    console.error('Synthesis error:', e)
  }

  await supabase
    .from('arnobot_blog_sessions')
    .upsert({
      user_id: userId,
      session_id: sessionId,
      title,
      summary,
      message_count: messageCount,
    }, { onConflict: 'session_id' })

  return NextResponse.json({ ok: true, summary })
}
