'use client'

import { useSignUp } from '@clerk/nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError('')
    try {
      await signUp.create({ firstName, lastName, emailAddress: email, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setStep('verify')
    } catch (err: unknown) {
      const msg = (err as { errors?: { message: string }[] })?.errors?.[0]?.message || 'Er is iets misgegaan'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError('')
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/bot')
      }
    } catch (err: unknown) {
      const msg = (err as { errors?: { message: string }[] })?.errors?.[0]?.message || 'Ongeldige code'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #f0ede6; font-family: 'Space Mono', monospace; }
        .su-input {
          background: #111; color: #f0ede6; border: 1.5px solid #333;
          border-radius: 4px; font-family: 'Space Mono', monospace;
          font-size: 15px; font-weight: 700; padding: 12px 16px; width: 100%;
          outline: none; transition: border-color 0.15s; line-height: 1.5;
        }
        .su-input:focus { border-color: #EE7700; }
        .su-input::placeholder { color: #444; }
        .su-btn {
          width: 100%; padding: 16px; background: #EE7700; color: #0a0a0a;
          border: none; border-radius: 999px; font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 3px; cursor: pointer; transition: background 0.2s;
        }
        .su-btn:hover { background: #ff8800; }
        .su-btn:disabled { background: #1a1a1a; color: #333; cursor: not-allowed; }
        .su-label { font-size: 11px; letter-spacing: 3px; color: #555; margin-bottom: 8px; display: block; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 6, color: '#EE7700', marginBottom: 8 }}>
            ARNOBOT UNLIMITED
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, letterSpacing: 1, marginBottom: 40, lineHeight: 1 }}>
            {step === 'form' ? 'ACCOUNT AANMAKEN' : 'VERIFIEER JE EMAIL'}
          </h1>

          {step === 'form' ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label className="su-label">VOORNAAM</label>
                  <input className="su-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Voornaam" required autoFocus />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="su-label">ACHTERNAAM</label>
                  <input className="su-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Achternaam" required />
                </div>
              </div>
              <div>
                <label className="su-label">E-MAILADRES</label>
                <input className="su-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jouw@email.nl" required />
              </div>
              <div>
                <label className="su-label">WACHTWOORD</label>
                <input className="su-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimaal 8 tekens" required minLength={8} />
              </div>
              {error && <p style={{ color: '#cc3300', fontSize: 13, letterSpacing: 1 }}>{error}</p>}
              <button className="su-btn" type="submit" disabled={loading || !firstName || !lastName || !email || !password}>
                {loading ? 'BEZIG...' : 'AANMELDEN →'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#555', letterSpacing: 1 }}>
                Al een account?{' '}
                <Link href="/sign-in" style={{ color: '#EE7700', textDecoration: 'none' }}>Inloggen</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ fontSize: 15, color: '#888', lineHeight: 1.8 }}>
                Er is een verificatiecode gestuurd naar <strong style={{ color: '#f0ede6' }}>{email}</strong>. Vul hem hieronder in.
              </p>
              <div>
                <label className="su-label">VERIFICATIECODE</label>
                <input className="su-input" value={code} onChange={e => setCode(e.target.value)} placeholder="000000" required autoFocus style={{ letterSpacing: 8, textAlign: 'center', fontSize: 24 }} />
              </div>
              {error && <p style={{ color: '#cc3300', fontSize: 13, letterSpacing: 1 }}>{error}</p>}
              <button className="su-btn" type="submit" disabled={loading || code.length < 6}>
                {loading ? 'BEZIG...' : 'BEVESTIGEN →'}
              </button>
            </form>
          )}

        </div>
      </div>
    </>
  )
}
