'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function JoinContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code') ?? ''
  const [teamName, setTeamName] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'joining' | 'done' | 'error' | 'invalid'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!code) { setStatus('invalid'); return }
    fetch(`/api/bot/team/join?code=${code}`)
      .then(r => r.json())
      .then(data => {
        if (data.teamName) { setTeamName(data.teamName); setStatus('ready') }
        else setStatus('invalid')
      })
      .catch(() => setStatus('invalid'))
  }, [code])

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
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 4, color: '#EE7700', marginBottom: 8 }}>ARNOBOT</p>

        {status === 'loading' && (
          <p style={{ fontFamily: "'Space Mono', monospace", color: '#555', fontSize: 13, letterSpacing: 2 }}>LADEN...</p>
        )}

        {status === 'invalid' && (
          <>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: '#f0ede6', marginBottom: 16 }}>ONGELDIGE LINK</h1>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#888', marginBottom: 32 }}>Deze uitnodigingslink is niet geldig of al verlopen.</p>
            <Link href="/bot" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#EE7700', textDecoration: 'none' }}>← TERUG NAAR ARNOBOT</Link>
          </>
        )}

        {status === 'ready' && (
          <>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px,8vw,64px)', color: '#f0ede6', lineHeight: 0.95, marginBottom: 24 }}>
              JE BENT UITGENODIGD.
            </h1>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: '#888', lineHeight: 1.8, marginBottom: 32 }}>
              Je wordt uitgenodigd om deel te nemen aan team<br />
              <span style={{ color: '#f0ede6', fontWeight: 700 }}>{teamName}</span>
            </p>
            <button
              onClick={join}
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3, padding: '16px 40px', background: '#EE7700', color: '#f0ede6', border: 'none', cursor: 'pointer' }}
            >
              DEELNEMEN
            </button>
          </>
        )}

        {status === 'joining' && (
          <p style={{ fontFamily: "'Space Mono', monospace", color: '#EE7700', fontSize: 13, letterSpacing: 2 }}>JOINEN...</p>
        )}

        {status === 'done' && (
          <>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: '#EE7700', marginBottom: 16 }}>WELKOM!</h1>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#888' }}>Je bent nu lid van {teamName}. Je wordt doorgestuurd...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: '#f0ede6', marginBottom: 16 }}>OEPS.</h1>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#888', marginBottom: 24 }}>{errorMsg}</p>
            <Link href="/bot" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#EE7700', textDecoration: 'none' }}>← TERUG NAAR ARNOBOT</Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinContent />
    </Suspense>
  )
}
