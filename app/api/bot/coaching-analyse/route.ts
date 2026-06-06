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

  const { data: profielRow } = await supabase
    .from('arnobot_blog_profiles')
    .select('profiel')
    .eq('user_id', userId)
    .single()

  const profiel = profielRow?.profiel ?? null
  const profielText = profiel
    ? `\n\nGEBRUIKERSPROFIEL:\nRol: ${profiel.rol || '—'}\nMarkt: ${Array.isArray(profiel.markt) ? profiel.markt.join(', ') : profiel.markt || '—'}\nWat verkoop je: ${profiel.wat_verkoop_je || '—'}\nIdeale klant: ${profiel.ideale_klant || '—'}\nGrootste uitdaging: ${profiel.uitdaging || '—'}`
    : ''

  const minRequired = sessionIds ? 3 : 5
  if (sessions.length < minRequired) {
    return NextResponse.json({ error: 'te_weinig', count: sessions.length }, { status: 400 })
  }

  // Dedup: check exacte match of grote overlap (Jaccard >= 0.8)
  const newIds = new Set(sessions.map(s => s.session_id))
  const idsKey = [...newIds].sort().join(',')

  const { data: existingAnalyses } = await supabase
    .from('arnobot_analyses')
    .select('id, analyse_text, created_at, session_count, session_ids')
    .eq('user_id', userId)

  const exactDuplicate = existingAnalyses?.find(a => {
    if (!Array.isArray(a.session_ids)) return false
    return (a.session_ids as string[]).slice().sort().join(',') === idsKey
  })

  if (exactDuplicate) {
    return NextResponse.json({
      duplicate: true,
      analyse: exactDuplicate.analyse_text,
      id: exactDuplicate.id,
      created_at: exactDuplicate.created_at,
      count: exactDuplicate.session_count,
    })
  }

  // Jaccard-overlap: als >= 80% overlap met een bestaande analyse → verwijs terug
  const similar = existingAnalyses?.find(a => {
    if (!Array.isArray(a.session_ids) || a.session_ids.length === 0) return false
    const existingIds = new Set(a.session_ids as string[])
    const intersection = [...newIds].filter(id => existingIds.has(id)).length
    const union = new Set([...newIds, ...existingIds]).size
    return intersection / union >= 0.8
  })

  if (similar) {
    return NextResponse.json({
      similar: true,
      analyse: similar.analyse_text,
      id: similar.id,
      created_at: similar.created_at,
      count: similar.session_count,
    })
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
      content: `Analyseer deze ${sessions.length} gesprekken en geef een patroonanalyse in Arno's stijl:${profielText}\n\nGESPREKKEN:\n${sessiesText}`
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
