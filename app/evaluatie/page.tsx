'use client'

import { useState } from 'react'

const FREQUENTIE = ['Dagelijks', '2-3x per week', '1x per week', 'Minder dan 1x per week']
const ONDERDELEN = ['ArnoBot chat', 'Bieb', 'Coaching', 'Analyses']
const BETALEN_OPTIES = ['Ja', 'Misschien', 'Nee']
const AANBEVELEN_OPTIES = ['Ja', 'Misschien', 'Nee']

export default function EvaluatiePage() {
  const [frequentie, setFrequentie] = useState('')
  const [onderdelen, setOnderdelen] = useState<string[]>([])
  const [waardevol, setWaardevol] = useState('')
  const [ontbreekt, setOntbreekt] = useState('')
  const [betalen, setBetalen] = useState('')
  const [betalenToelichting, setBetalenToelichting] = useState('')
  const [aanbevelen, setAanbevelen] = useState('')
  const [aanbevelenToelichting, setAanbevelenToelichting] = useState('')
  const [naam, setNaam] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function toggleOnderdeel(o: string) {
    setOnderdelen(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o])
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!frequentie || !betalen || !aanbevelen) {
      setError('Vul minimaal de meerkeuzevragen in.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/evaluatie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam, frequentie, onderdelen, waardevol, ontbreekt, betalen, betalenToelichting, aanbevelen, aanbevelenToelichting }),
      })
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      setError('Er ging iets mis. Probeer opnieuw.')
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111827; color: #f1f5f9; font-family: 'Space Mono', monospace; font-weight: 400; }
        .opt-btn {
          background: #1f2937; border: 1.5px solid #374151;
          color: #9ca3af; font-family: 'Space Mono', monospace;
          font-size: 14px; padding: 10px 20px; cursor: pointer;
          border-radius: 4px; transition: all 0.15s; text-align: left;
        }
        .opt-btn:hover { border-color: #6b7280; color: #f1f5f9; }
        .opt-btn.selected { border-color: #f59e0b; color: #f59e0b; background: #1f2937; }
        textarea, input[type="text"] {
          width: 100%; background: #1f2937; border: 1.5px solid #374151;
          color: #f1f5f9; font-family: 'Space Mono', monospace;
          font-size: 15px; padding: 12px 16px; border-radius: 4px;
          outline: none; resize: vertical; transition: border-color 0.15s;
        }
        textarea:focus, input[type="text"]:focus { border-color: #f59e0b; }
        textarea::placeholder, input[type="text"]::placeholder { color: #4b5563; }
      `}</style>

      <div style={{ maxWidth: 812, margin: '0 auto', padding: 'clamp(80px,12vw,120px) clamp(16px,4vw,20px) 80px' }}>

        <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: '#f59e0b', fontSize: 13, letterSpacing: 4, marginBottom: 8 }}>ARNOBOT</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px,8vw,64px)', letterSpacing: 3, lineHeight: 1, color: '#f1f5f9', marginBottom: 16 }}>EVALUATIE</h1>
        <p style={{ fontSize: 15, lineHeight: 1.9, color: '#9ca3af', marginBottom: 56 }}>
          30 dagen ArnoBot. Wat vond je ervan? Vijf minuten, eerlijk antwoord. Helpt ons de app beter te maken.
        </p>

        {sent ? (
          <div style={{ background: '#1f2937', borderLeft: '3px solid #f59e0b', padding: '32px 28px' }}>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: '#f1f5f9', marginBottom: 12 }}>BEDANKT</p>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: '#9ca3af' }}>Je feedback is ontvangen. We nemen hem serieus.</p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

            {/* Naam */}
            <div>
              <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 16 }}>NAAM (optioneel)</p>
              <input type="text" value={naam} onChange={e => setNaam(e.target.value)} placeholder="Jouw naam" />
            </div>

            {/* Vraag 1 */}
            <div>
              <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 4 }}>01</p>
              <p style={{ fontSize: 15, lineHeight: 1.9, color: '#f1f5f9', marginBottom: 20 }}>Hoe vaak heb je ArnoBot de afgelopen 30 dagen gebruikt?</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FREQUENTIE.map(f => (
                  <button type="button" key={f} className={`opt-btn${frequentie === f ? ' selected' : ''}`} onClick={() => setFrequentie(f)}>{f}</button>
                ))}
              </div>
            </div>

            {/* Vraag 2 */}
            <div>
              <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 4 }}>02</p>
              <p style={{ fontSize: 15, lineHeight: 1.9, color: '#f1f5f9', marginBottom: 20 }}>Welke onderdelen heb je gebruikt? (meerdere mogelijk)</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ONDERDELEN.map(o => (
                  <button type="button" key={o} className={`opt-btn${onderdelen.includes(o) ? ' selected' : ''}`} onClick={() => toggleOnderdeel(o)}>{o}</button>
                ))}
              </div>
            </div>

            {/* Vraag 3 */}
            <div>
              <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 4 }}>03</p>
              <p style={{ fontSize: 15, lineHeight: 1.9, color: '#f1f5f9', marginBottom: 20 }}>Wat is het meest waardevolle dat ArnoBot je heeft gegeven?</p>
              <textarea rows={4} value={waardevol} onChange={e => setWaardevol(e.target.value)} placeholder="Concreet, graag." />
            </div>

            {/* Vraag 4 */}
            <div>
              <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 4 }}>04</p>
              <p style={{ fontSize: 15, lineHeight: 1.9, color: '#f1f5f9', marginBottom: 20 }}>Wat ontbreekt er, of werkt niet zoals je verwacht?</p>
              <textarea rows={4} value={ontbreekt} onChange={e => setOntbreekt(e.target.value)} placeholder="Geen sugarcoating nodig." />
            </div>

            {/* Vraag 5 */}
            <div>
              <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 4 }}>05</p>
              <p style={{ fontSize: 15, lineHeight: 1.9, color: '#f1f5f9', marginBottom: 20 }}>Zou je €77/maand betalen voor de pro-versie?</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: betalen === 'Nee' || betalen === 'Misschien' ? 16 : 0 }}>
                {BETALEN_OPTIES.map(o => (
                  <button type="button" key={o} className={`opt-btn${betalen === o ? ' selected' : ''}`} onClick={() => setBetalen(o)}>{o}</button>
                ))}
              </div>
              {(betalen === 'Nee' || betalen === 'Misschien') && (
                <input type="text" value={betalenToelichting} onChange={e => setBetalenToelichting(e.target.value)} placeholder="Waarom niet?" />
              )}
            </div>

            {/* Vraag 6 */}
            <div>
              <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 4 }}>06</p>
              <p style={{ fontSize: 15, lineHeight: 1.9, color: '#f1f5f9', marginBottom: 20 }}>Zou je ArnoBot aan anderen aanbevelen?</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: aanbevelen === 'Nee' || aanbevelen === 'Misschien' ? 16 : 0 }}>
                {AANBEVELEN_OPTIES.map(o => (
                  <button type="button" key={o} className={`opt-btn${aanbevelen === o ? ' selected' : ''}`} onClick={() => setAanbevelen(o)}>{o}</button>
                ))}
              </div>
              {(aanbevelen === 'Nee' || aanbevelen === 'Misschien') && (
                <input type="text" value={aanbevelenToelichting} onChange={e => setAanbevelenToelichting(e.target.value)} placeholder="Waarom niet?" />
              )}
            </div>

            {error && (
              <p style={{ fontSize: 14, color: '#cc2200', letterSpacing: 1 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3,
                padding: '12px 36px', borderRadius: 999, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#374151' : '#f59e0b', color: '#111827',
                alignSelf: 'flex-start', transition: 'background 0.15s',
              }}
            >
              {loading ? 'VERSTUREN...' : 'VERSTUUR EVALUATIE'}
            </button>

          </form>
        )}
      </div>
    </>
  )
}
