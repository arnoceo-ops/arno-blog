import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: coachingRow } = await supabase
    .from('arnobot_coaching')
    .select('coaching_data')
    .eq('user_id', userId)
    .single()

  let context = ''
  if (coachingRow?.coaching_data) {
    const doc = coachingRow.coaching_data as Record<string, unknown>
    const focus = doc.focus as string ?? ''
    const blinde_vlekken = doc.blinde_vlekken as string ?? ''
    const ontwikkelpunten = (doc.ontwikkelpunten as string[]) ?? []
    context = `Focus: ${focus}\nBlinde vlekken: ${blinde_vlekken}\nOntwikkelpunten: ${ontwikkelpunten.join(', ')}`
  }

  const prompt = context
    ? `Je bent Arno Diepeveen, harde sales coach. Genereer één scherpe dagelijkse uitdagingsvraag voor deze salesprofessional op basis van hun coachingsprofiel.\n\n${context}\n\nRegel: alleen de vraag zelf. Geen inleiding, geen uitleg. Max 2 zinnen. Confronterend en actiegericht.\n\nBelangrijk: gebruik alleen specifieke details die rechtstreeks uit het bovenstaande coachingsprofiel komen. Verzin geen getallen, tijdframes of aannames die niet in dat profiel staan — die kloppen mogelijk niet voor deze persoon.`
    : `Je bent Arno Diepeveen, harde sales coach. Genereer één scherpe dagelijkse uitdagingsvraag voor een salesprofessional. Confronterend, actiegericht, max 2 zinnen. Alleen de vraag zelf.\n\nBelangrijk: verzin geen specifieke getallen, tijdframes of situaties — er is geen profielcontext beschikbaar. Stel de vraag zo dat die klopt voor wie hem leest.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 120,
    messages: [{ role: 'user', content: prompt }],
  })

  const uitdaging = ((response.content[0] as { type: string; text?: string }).text ?? '').trim()

  return NextResponse.json({ uitdaging })
}
