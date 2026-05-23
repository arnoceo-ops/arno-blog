'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/arnobot-admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/spar/admin')
    } else {
      setError('Verkeerde gebruikersnaam of wachtwoord.')
    }
    setLoading(false)
  }

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 24px' }}>
        <p style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '4px', marginBottom: '12px' }}>ARNOBOT</p>
        <h1 style={{ color: '#f0ede6', fontSize: '48px', fontWeight: 700, margin: '0 0 40px 0', letterSpacing: '-1px' }}>Admin</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ background: '#111', border: '1px solid #222', color: '#f0ede6', padding: '14px 16px', fontSize: '14px', outline: 'none' }}
          />
          {error && <p style={{ color: '#ff4444', fontSize: '13px', margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ background: loading ? '#333' : '#EE7700', color: '#000', border: 'none', padding: '14px', fontSize: '14px', fontWeight: 700, letterSpacing: '2px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
          >
            {loading ? 'INLOGGEN...' : 'INLOGGEN'}
          </button>
        </form>
      </div>
    </main>
  )
}
