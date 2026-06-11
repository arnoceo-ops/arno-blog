'use client'

import { useState } from 'react'

const FREQUENTIE = ['Dagelijks', '2-3x per week', '1x per week', 'Minder dan 1x per week']
const ONDERDELEN = ['ArnoBot chat', 'Bieb', 'Coaching', 'Analyses']
const BETALEN_OPTIES = ['Ja', 'Misschien', 'Nee']
const AANBEVELEN_OPTIES = ['Ja', 'Misschien', 'Nee']

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 18px',
        border: selected ? '2px solid #f59e0b' : '1.5px solid #374151',
        background: selected ? 'rgba(245,158,11,0.12)' : '#1f2937',
        color: selected ? '#f59e0b' : '#9ca3af',
        fontFamily: "'Space Mono', monospace",
        fontSize: 15,
        fontWeight: 400,
        cursor: 'pointer',
        borderRadius: 4,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

function Block({ nr, title, children }: { nr: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48, borderBottom: '1px solid #374151', paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, letterSpacing: 4, color: '#f59e0b' }}>{nr}</span>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, fontWeight: 400, color: '#f1f5f9', margin: 0, letterSpacing: 1 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

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
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, lineHeight: 1, color: '#f1f5f9', marginBottom: 16 }}>EVALUATIE</h1>
        <p style={{ fontSize: 15, lineHeight: 1.9, color: '#9ca3af', marginBottom: 56 }}>
          30 dagen ArnoBot. Wat vond je ervan? Vijf minuten, eerlijk antwoord. Helpt ons de app beter te maken.
        </p>

        {sent ? (
          <div style={{ background: '#1f2937', borderLeft: '3px solid #f59e0b', padding: '32px 28px' }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: '#f1f5f9', marginBottom: 12 }}>BEDANKT</h2>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: '#9ca3af' }}>Je feedback is ontvangen. We nemen hem serieus.</p>
          </div>
        ) : (
          <form onSubmit={submit}>

            <Block nr="—" title="Naam (optioneel)">
              <input type="text" value={naam} onChange={e => setNaam(e.target.value)} placeholder="Jouw naam" />
            </Block>

            <Block nr="01" title="Hoe vaak heb je ArnoBot de afgelopen 30 dagen gebruikt?">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FREQUENTIE.map(f => (
                  <Chip key={f} label={f} selected={frequentie === f} onClick={() => setFrequentie(f)} />
                ))}
              </div>
            </Block>

            <Block nr="02" title="Welke onderdelen heb je gebruikt?">
              <p style={{ fontSize: 13, color: '#6b7280', letterSpacing: 2, marginBottom: 16 }}>MEERDERE MOGELIJK</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ONDERDELEN.map(o => (
                  <Chip key={o} label={o} selected={onderdelen.includes(o)} onClick={() => toggleOnderdeel(o)} />
                ))}
              </div>
            </Block>

            <Block nr="03" title="Wat is het meest waardevolle dat ArnoBot je heeft gegeven?">
              <textarea rows={4} value={waardevol} onChange={e => setWaardevol(e.target.value)} placeholder="Concreet, graag." />
            </Block>

            <Block nr="04" title="Wat ontbreekt er, of werkt niet zoals je verwacht?">
              <textarea rows={4} value={ontbreekt} onChange={e => setOntbreekt(e.target.value)} placeholder="Geen sugarcoating nodig." />
            </Block>

            <Block nr="05" title="Zou je €77/maand betalen voor de pro-versie?">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: (betalen === 'Nee' || betalen === 'Misschien') ? 16 : 0 }}>
                {BETALEN_OPTIES.map(o => (
                  <Chip key={o} label={o} selected={betalen === o} onClick={() => setBetalen(o)} />
                ))}
              </div>
              {(betalen === 'Nee' || betalen === 'Misschien') && (
                <input type="text" value={betalenToelichting} onChange={e => setBetalenToelichting(e.target.value)} placeholder="Waarom niet?" />
              )}
            </Block>

            <Block nr="06" title="Zou je ArnoBot aan anderen aanbevelen?">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: (aanbevelen === 'Nee' || aanbevelen === 'Misschien') ? 16 : 0 }}>
                {AANBEVELEN_OPTIES.map(o => (
                  <Chip key={o} label={o} selected={aanbevelen === o} onClick={() => setAanbevelen(o)} />
                ))}
              </div>
              {(aanbevelen === 'Nee' || aanbevelen === 'Misschien') && (
                <input type="text" value={aanbevelenToelichting} onChange={e => setAanbevelenToelichting(e.target.value)} placeholder="Waarom niet?" />
              )}
            </Block>

            {error && (
              <p style={{ fontSize: 14, color: '#cc2200', letterSpacing: 1, marginBottom: 24 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3,
                padding: '12px 36px', borderRadius: 999, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#374151' : '#f59e0b', color: '#111827',
                transition: 'background 0.15s',
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
