'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

function JoinContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const code = searchParams.get('code') ?? ''
  const [teamName, setTeamName] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'joining' | 'done' | 'error' | 'invalid'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!isLoaded) return
    if (!code) { setStatus('invalid'); return }
    fetch(`/api/bot/team/join?code=${code}`)
      .then(r => r.json())
      .then(data => {
        if (data.teamName) { setTeamName(data.teamName); setStatus('ready') }
        else setStatus('invalid')
      })
      .catch(() => setStatus('invalid'))
  }, [code, isLoaded])

  async function join() {
    setStatus('joining')
    try {
      const res = await fetch('/api/bot/team/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: code }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error || 'Mislukt'); setStatus('error'); return }
      setStatus('done')
      setTimeout(() => router.push('/bot'), 2000)
    } catch {
      setErrorMsg('Er ging iets mis')
      setStatus('error')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111827; color: #f1f5f9; font-family: 'Space Mono', monospace; font-weight: 400; }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 8 }}>ARNOBOT</p>

          {status === 'loading' && (
            <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 15, color: '#6b7280', letterSpacing: 2 }}>LADEN...</p>
          )}

          {status === 'invalid' && (
            <>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, color: '#f1f5f9', lineHeight: 1, marginBottom: 16 }}>ONGELDIGE LINK.</h1>
              <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 15, color: '#9ca3af', lineHeight: 1.9, marginBottom: 32 }}>Deze uitnodigingslink is niet geldig of al verlopen.</p>
              <Link href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#f59e0b', textDecoration: 'none' }}>← NAAR ROYALDUTCHSALES.COM</Link>
            </>
          )}

          {status === 'ready' && (
            <>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, color: '#f1f5f9', lineHeight: 1, marginBottom: 24 }}>
                JE BENT UITGENODIGD.
              </h1>
              <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 15, color: '#9ca3af', lineHeight: 1.9, marginBottom: 32 }}>
                Je wordt uitgenodigd om deel te nemen aan team<br />
                <span style={{ color: '#f1f5f9', fontWeight: 400 }}>{teamName}</span>
              </p>
              {isSignedIn ? (
                <button onClick={join} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, padding: '12px 36px', background: '#f59e0b', color: '#111827', border: 'none', borderRadius: 999, cursor: 'pointer', transition: 'background 0.2s' }}>
                  DEELNEMEN
                </button>
              ) : (
                <>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 13, color: '#6b7280', lineHeight: 1.9, marginBottom: 20 }}>
                    Je hebt een account nodig om deel te nemen.
                  </p>
                  <Link
                    href={`/sign-in?redirect_url=${encodeURIComponent(`/bot/team/join?code=${code}`)}`}
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, padding: '12px 36px', background: '#f59e0b', color: '#111827', border: 'none', borderRadius: 999, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}
                  >
                    INLOGGEN OF AANMELDEN
                  </Link>
                </>
              )}
            </>
          )}

          {status === 'joining' && (
            <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 15, color: '#f59e0b', letterSpacing: 2 }}>JOINEN...</p>
          )}

          {status === 'done' && (
            <>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, color: '#f59e0b', lineHeight: 1, marginBottom: 16 }}>WELKOM!</h1>
              <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 15, color: '#9ca3af', lineHeight: 1.9 }}>Je bent nu lid van {teamName}. Je wordt doorgestuurd...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, color: '#f1f5f9', lineHeight: 1, marginBottom: 16 }}>OEPS.</h1>
              <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 15, color: '#9ca3af', lineHeight: 1.9, marginBottom: 32 }}>{errorMsg}</p>
              <Link href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#f59e0b', textDecoration: 'none' }}>← NAAR ROYALDUTCHSALES.COM</Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinContent />
    </Suspense>
  )
}
