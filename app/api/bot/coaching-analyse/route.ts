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

  const body = await req.json().catch(() => ({}))
  const sessionIds: string[] | undefined = body.sessionIds

  const { data } = await supabase
    .from('arnobot_blog_sessions')
    .select('title, summary, message_count, created_at, session_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  let sessions = data ?? []

  if (sessionIds && sessionIds.length > 0) {
    sessions = sessions.filter(s => sessionIds.includes(s.session_id))
  }

  const minRequired = sessionIds ? 3 : 5
  if (sessions.length < minRequired) {
    return NextResponse.json({ error: 'te_weinig', count: sessions.length }, { status: 400 })
  }

  const sessiesText = sessions
    .map((s, i) =>
      `Gesprek ${i + 1} (${new Date(s.created_at).toLocaleDateString('nl-NL')}): ${s.title}${s.summary ? `\nSamenvatting: ${s.summary}` : ''}`
    )
    .join('\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: `Je bent Arno Diepeveen. Salesstrateeg, direct, ongefilterd. Je analyseert de gesprekken van iemand die jouw bot gebruikt en geeft een patroonanalyse. Spreek de gebruiker direct aan met "je". Geen bullet points. Geen inleiding. Gewoon de patronen, wat ze zeggen, en één concrete uitdaging die de gebruiker zichzelf moet stellen. Max 3 alinea's. Geen accenten op woorden voor nadruk.`,
    messages: [{
      role: 'user',
      content: `Analyseer deze ${sessions.length} gesprekken en geef een patroonanalyse in Arno's stijl:\n\n${sessiesText}`
    }]
  })

  const analyse = response.content[0].type === 'text' ? response.content[0].text : ''

  const { data: saved } = await supabase
    .from('arnobot_analyses')
    .insert({
      user_id: userId,
      analyse_text: analyse,
      session_count: sessions.length,
      session_ids: sessions.map(s => s.session_id),
    })
    .select('id, created_at')
    .single()

  return NextResponse.json({ analyse, count: sessions.length, id: saved?.id, created_at: saved?.created_at })
}
