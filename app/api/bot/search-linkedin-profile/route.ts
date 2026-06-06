import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('arnobot_admin')?.value
  if (!token || token !== process.env.ARNOBOT_ADMIN_KEY) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { userId, name } = await req.json()
  if (!userId || !name) return NextResponse.json({ error: 'userId en name verplicht' }, { status: 400 })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    tools: [{ type: 'web_search_20250305' as const, name: 'web_search' }],
    messages: [{
      role: 'user',
      content: `Zoek het LinkedIn-profiel van "${name}". Gebruik web_search met de query: site:linkedin.com/in "${name}". Geef alleen de volledige linkedin.com/in/... URL terug, niets anders. Als je geen resultaat vindt, geef dan terug: NIET_GEVONDEN.`,
    }],
  })

  let linkedinUrl: string | null = null
  for (const block of response.content) {
    if (block.type === 'text') {
      const match = block.text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s"'<>]+/)
      if (match) {
        linkedinUrl = match[0].replace(/[.,;]+$/, '')
        break
      }
    }
  }

  if (linkedinUrl) {
    await supabase
      .from('approved_users')
      .update({ linkedin: linkedinUrl })
      .eq('user_id', userId)
  }

  return NextResponse.json({ linkedinUrl })
}
