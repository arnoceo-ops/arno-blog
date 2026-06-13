'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WelkomPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  async function handleGaVerder() {
    setLoading(true)
    try {
      const res = await fetch('/api/bot/welcome-done', { method: 'POST' })
      if (!res.ok) throw new Error('Opslaan mislukt')
      router.push('/bot/profiel')
    } catch {
      setLoading(false)
      setError(true)
      setTimeout(() => setError(false), 4000)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111827; color: #f1f5f9; font-family: 'Space Mono', monospace; font-weight: 400; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(80px,12vw,120px) clamp(16px,4vw,20px) 80px' }}>

        <div style={{ width: '100%', maxWidth: 812 }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 12 }}>ARNOBOT</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, lineHeight: 1, color: '#f1f5f9', marginBottom: 8 }}>WELKOM.</h1>
          <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 15, lineHeight: 1.9, color: '#9ca3af', marginBottom: 32 }}>
            Kijk de video in zijn geheel af. 05:49 lousy minutes met de basics. Te ongeduldig? Log dan een andere keer in of doe niet mee. Cheers!
          </p>

          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: 32, overflow: 'hidden' }}>
            <iframe
              src="https://www.loom.com/embed/0ac8f70256fa4ecb8d49bc111c897050?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true"
              frameBorder={0}
              allowFullScreen
              style={{ position: 'absolute', top: -36, left: 0, width: '100%', height: 'calc(100% + 36px)' }}
            />
          </div>

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

          {error && (
            <p style={{ marginTop: 16, fontSize: 13, color: '#f59e0b', letterSpacing: 2, fontFamily: "'Space Mono', monospace" }}>
              Er ging iets mis. Probeer opnieuw.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
