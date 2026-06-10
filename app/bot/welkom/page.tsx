'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function WelkomPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [tooEarly, setTooEarly] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleGaVerder() {
    if (!videoEnded) {
      setTooEarly(true)
      setTimeout(() => setTooEarly(false), 3000)
      return
    }
    setLoading(true)
    await fetch('/api/bot/welcome-done', { method: 'POST' })
    router.push('/bot/profiel')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111827; color: #f1f5f9; font-family: 'Space Mono', monospace; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(40px,8vw,80px) clamp(20px,5vw,48px)' }}>

        <div style={{ width: '100%', maxWidth: 720 }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 12 }}>ARNOBOT</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(48px,10vw,80px)', letterSpacing: 3, lineHeight: 1, color: '#f1f5f9', marginBottom: 8 }}>WELKOM.</h1>
          <p style={{ fontSize: 15, lineHeight: 1.9, color: '#9ca3af', marginBottom: 32 }}>
            Kijk even de video af. Dan weet je precies hoe je het meeste uit ArnoBot haalt.
          </p>

          <video
            ref={videoRef}
            src="/onboarding.mp4"
            controls
            playsInline
            onEnded={() => setVideoEnded(true)}
            style={{ width: '100%', display: 'block', background: '#000', borderRadius: 4, marginBottom: 32 }}
          />

          <button
            onClick={handleGaVerder}
            disabled={loading}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 18,
              letterSpacing: 3,
              padding: '12px 36px',
              borderRadius: 999,
              background: '#f59e0b',
              color: '#111827',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'EVEN WACHTEN...' : 'GA VERDER →'}
          </button>

          {tooEarly && (
            <p style={{ marginTop: 16, fontSize: 13, color: '#f59e0b', letterSpacing: 2, fontFamily: "'Space Mono', monospace" }}>
              Kijk eerst de video af.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
