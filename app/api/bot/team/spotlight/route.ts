import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  // Verify manager
  const { data: managerMember } = await supabase
    .from('arnobot_team_members')
    .select('team_id, arnobot_teams(name)')
    .eq('user_id', userId)
    .eq('role', 'manager')
    .single()

  if (!managerMember) return NextResponse.json({ error: 'Geen manager-toegang' }, { status: 403 })

  const team = managerMember.arnobot_teams as { name: string }

  // Get all team member IDs
  const { data: members } = await supabase
    .from('arnobot_team_members')
    .select('user_id')
    .eq('team_id', managerMember.team_id)

  if (!members?.length) return NextResponse.json({ error: 'Geen teamleden' }, { status: 400 })

  const memberIds = members.map(m => m.user_id)

  // Collect recent session summaries from all team members
  const { data: sessions } = await supabase
    .from('arnobot_blog_sessions')
    .select('user_id, summary, feiten')
    .in('user_id', memberIds)
    .order('created_at', { ascending: false })
    .limit(40)

  if (!sessions?.length) return NextResponse.json({ error: 'Niet genoeg data voor een team-analyse' }, { status: 400 })

  const teamData = sessions
    .filter(s => s.summary)
    .map(s => `- ${s.summary}${s.feiten ? '\n  Feiten: ' + s.feiten.slice(0, 200) : ''}`)
    .join('\n\n')
    .slice(0, 6000)

  const result = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: `Je bent Arno Diepeveen, salescoach met 40 jaar ervaring. Direct, ongefilterd, geen bullshit.
Je analyseert patronen van een heel salesteam op basis van hun gesprekken met ArnoBot.
Schrijf in eerste persoon alsof je het team direct aanspreekt. Maximaal 4 punten.`,
    messages: [{
      role: 'user',
      content: `Analyseer de collectieve patronen van team "${team.name}" op basis van deze gesprekssamengevattingen.
Wat zijn de gemeenschappelijke blinde vlekken? Waar scoren ze collectief zwak? Wat is de sterkste collectieve kracht?
Wees concreet en direct — geen algemene salespraat.

GESPREKKEN:
${teamData}`
    }]
  })

  const analyse = result.content[0].type === 'text' ? result.content[0].text : ''
  return NextResponse.json({ analyse })
}
