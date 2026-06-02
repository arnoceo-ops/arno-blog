'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function BotAanmeldenPage() {
  const [form, setForm] = useState({ naam: '', email: '', telefoon: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bot/aanmelden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Er ging iets mis')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis')
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
        .field-input {
          display: block; width: 100%; padding: 14px 18px;
          background: #111; color: #f0ede6;
          border: 1.5px solid #333; border-radius: 6px;
          font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700;
          outline: none; transition: border-color 0.15s;
        }
        .field-input:focus { border-color: #EE7700; }
        .field-input::placeholder { color: #444; font-weight: 400; }
      `}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 40px', display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3 }}>HOME</Link>
          <span style={{ color: '#EE7700', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3 }}>BOT</span>
        </div>
      </nav>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 80px' }}>
        <div style={{ maxWidth: 520, width: '100%' }}>

          {submitted ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 80, color: '#EE7700', lineHeight: 1, marginBottom: 16 }}>✓</div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: '#f0ede6', lineHeight: 1.0, letterSpacing: 1, marginBottom: 24 }}>
                Goed<br />besluit.<br /><span style={{ color: '#EE7700' }}>Echt.</span>
              </h1>
              <p style={{ fontSize: 15, fontWeight: 700, lineHeight: '30px', color: '#888', marginBottom: 16 }}>
                Je aanmelding is binnen. Je ontvangt direct een e-mail met een link om je account aan te maken.
              </p>
              <p style={{ fontSize: 13, color: '#555', lineHeight: '24px' }}>
                Geen mail ontvangen? Check je spam of mail naar{' '}
                <a href="mailto:info@royaldutchsales.com" style={{ color: '#EE7700' }}>info@royaldutchsales.com</a>
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 6, color: '#EE7700', marginBottom: 12 }}>ARNOBOT UNLIMITED</p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: '#f0ede6', lineHeight: 1.0, letterSpacing: 1, marginBottom: 16 }}>
                30 dagen.<br />Gratis.<br /><span style={{ color: '#EE7700' }}>Geen creditcard.</span>
              </h1>
              <div style={{ borderLeft: '4px solid #EE7700', paddingLeft: 20, marginBottom: 40 }}>
                <p style={{ fontSize: 15, fontWeight: 700, lineHeight: '30px', color: '#888' }}>
                  40 jaar saleskennis van Arno Diepeveen — direct, ongefilterd, afgestemd op jouw situatie. Na je trial geef je per e-mail aan of je doorgaat.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#888', marginBottom: 8 }}>NAAM</label>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="Jan de Vries"
                      value={form.naam}
                      onChange={e => setForm({ ...form, naam: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#888', marginBottom: 8 }}>E-MAILADRES</label>
                    <input
                      className="field-input"
                      type="email"
                      placeholder="jan@bedrijf.nl"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#888', marginBottom: 8 }}>
                      TELEFOON <span style={{ fontSize: 12, color: '#444', letterSpacing: 1 }}>OPTIONEEL</span>
                    </label>
                    <input
                      className="field-input"
                      type="tel"
                      placeholder="+31 6 12345678"
                      value={form.telefoon}
                      onChange={e => setForm({ ...form, telefoon: e.target.value })}
                    />
                  </div>
                </div>

                {error && <p style={{ color: '#c0392b', fontSize: 14, marginBottom: 16, fontWeight: 700 }}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '16px', background: '#EE7700',
                    color: '#0a0a0a', border: 'none', borderRadius: 999,
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
                  }}
                >
                  {loading ? 'BEZIG...' : 'START MIJN GRATIS TRIAL →'}
                </button>
                <p style={{ fontSize: 13, color: '#444', textAlign: 'center', marginTop: 16, lineHeight: '22px', letterSpacing: 1 }}>
                  GEEN KLEINE LETTERTJES. WEL EEN GROOT PLAN.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}
