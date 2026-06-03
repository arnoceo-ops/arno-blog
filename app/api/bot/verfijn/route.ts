import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { vraag, profiel } = await req.json()
    if (!vraag?.trim()) return NextResponse.json({ verfijnd: vraag })

    const profielHint = profiel?.rol
      ? `De gebruiker is ${profiel.rol}${profiel.markt ? ` in de markt: ${Array.isArray(profiel.markt) ? profiel.markt.join(', ') : profiel.markt}` : ''}.`
      : ''

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      system: `Je helpt mensen een scherpere vraag formuleren voor een gesprek met Arno Diepeveen, salesstrateeg. ${profielHint}

De gebruiker heeft een ruwe gedachte of situatie getypt. Herschrijf het als één scherpe, specifieke vraag die meer uit het gesprek haalt. Gebruik Arno's directe stijl: concreet, provocerend, geen vaagheid, geen omwegen. Geef alleen de vraag — geen uitleg, geen inleiding, geen aanhalingstekens.`,
      messages: [{ role: 'user', content: vraag }]
    })

    const verfijnd = response.content[0].type === 'text' ? response.content[0].text.trim() : vraag
    return NextResponse.json({ verfijnd })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
