import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text, speed = 1.0 } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'No text' }, { status: 400 })

  const clampedSpeed = Math.min(Math.max(Number(speed) || 1.0, 0.25), 4.0)
  const truncated = String(text).slice(0, 4096)

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      voice: 'onyx',
      input: truncated,
      speed: clampedSpeed,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('OpenAI TTS error:', err)
    return NextResponse.json({ error: 'TTS mislukt' }, { status: 502 })
  }

  const buffer = await res.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  })
}
