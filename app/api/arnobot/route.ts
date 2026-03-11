import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { label, sub, answer } = await req.json()

    if (!answer?.trim()) {
      return NextResponse.json({ feedback: 'Vul dit veld in voor ArnoBot feedback.' })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      system: `Je bent ArnoBot — de scherpe, directe AI-coach van Royal Dutch Sales. 
Je geeft korte, zakelijke feedback op strategische antwoorden van ondernemers en salesdirecteuren.

Regels:
- Max 3-4 zinnen
- Geen complimenten, geen zachte taal
- Wees concreet: benoem wat sterk is en wat ontbreekt of scherper kan
- Stel 1 verdiepende vraag aan het einde
- Schrijf in het Nederlands
- Tone: directe senior sales consultant, niet een coach die aait`,

      messages: [
        {
          role: 'user',
          content: `Canvas sectie: ${label} — ${sub}

Antwoord van de ondernemer:
"${answer}"

Geef feedback op dit antwoord.`,
        },
      ],
    })

    const feedback = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('')

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('ArnoBot error:', error)
    return NextResponse.json(
      { error: 'ArnoBot is tijdelijk niet beschikbaar.' },
      { status: 500 }
    )
  }
}
