'use client'

import { useSignIn } from '@clerk/nextjs'
import { useState } from 'react'

export default function SignInPage() {
  const { signIn } = useSignIn()
  const [error, setError] = useState('')

  async function handleLinkedIn() {
    if (!signIn) return
    setError('')
    try {
      await signIn.sso({
        strategy: 'oauth_linkedin_oidc',
        redirectUrl: '/bot',
        redirectCallbackUrl: '/sso-callback',
      })
    } catch (err: unknown) {
      const msg = (err as { errors?: { message: string }[] })?.errors?.[0]?.message || 'Er is iets misgegaan'
      setError(msg)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #f0ede6; font-family: 'Space Mono', monospace; }
        .li-btn {
          width: 100%; padding: 16px 24px; background: #0A66C2; color: #fff;
          border: none; border-radius: 999px; font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 3px; cursor: pointer; transition: background 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 12px;
        }
        .li-btn:hover { background: #0856A4; }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 6, color: '#EE7700', marginBottom: 8 }}>ARNOBOT UNLIMITED</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, letterSpacing: 1, lineHeight: 1 }}>INLOGGEN</h1>
          </div>
          <button className="li-btn" onClick={handleLinkedIn} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            DOORGAAN MET LINKEDIN
          </button>
          {error && <p style={{ color: '#cc3300', fontSize: 13, letterSpacing: 1, textAlign: 'center' }}>{error}</p>}
          <p style={{ fontSize: 12, color: '#333', letterSpacing: 1, textAlign: 'center', lineHeight: 1.8 }}>
            Nog geen account? LinkedIn-login maakt automatisch een account aan.
          </p>
        </div>
      </div>
    </>
  )
}
