'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import BotNav from '@/app/bot/BotNav'

type Answers = {
  rol: string
  gebruik: string
  markt: string[]
  wat_verkoop_je: string
  ideale_klant: string
  uitdaging: string
  dealgrootte: string
  salescyclus: string
  target_dit_jaar: string
  target_3_jaar: string
  teamgrootte: string
  jaren_sales: string
  jaren_functie: string
}

const empty: Answers = {
  rol: '',
  gebruik: '',
  markt: [],
  wat_verkoop_je: '',
  ideale_klant: '',
  uitdaging: '',
  dealgrootte: '',
  salescyclus: '',
  target_dit_jaar: '',
  target_3_jaar: '',
  teamgrootte: '',
  jaren_sales: '',
  jaren_functie: '',
}

const TARGET_DIT_JAAR_OPTIONS = ['Ja', 'Nee']
const TARGET_3_JAAR_OPTIONS = ['Ja', 'Nee']
const TEAMGROOTTE_OPTIONS = ['1-3', '4-10', '11-25', '>25']
const ROL_OPTIONS = ['AE Hunter', 'AM Farmer', 'Key AM', 'Inside Sales', 'Sales Director', 'VP of Sales', 'CEO/DGA', 'Solopreneur', 'Anders']
const HEEFT_TEAM = ['Sales Director', 'VP of Sales', 'CEO/DGA']
const JAREN_SALES_OPTIONS = ['< 2 jaar', '2-5 jaar', '5-10 jaar', '10-20 jaar', '> 20 jaar']
const JAREN_FUNCTIE_OPTIONS = ['< 1 jaar', '1-3 jaar', '3-7 jaar', '> 7 jaar']

function getTargetLabel(rol: string) {
  if (['Sales Director', 'VP of Sales'].includes(rol)) return 'team'
  if (rol === 'CEO/DGA') return 'company'
  if (rol === 'Solopreneur') return ''
  return 'individuele'
}
const MARKT_OPTIONS = ['B2B MKB', 'B2B Enterprise', 'B2C', 'Overheid', 'Investeerders']

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 18px',
        border: selected ? '2px solid #f59e0b' : '1.5px solid #374151',
        background: selected ? 'rgba(238,119,0,0.12)' : '#1f2937',
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
    <div style={{ marginBottom: 48, borderBottom: '1px solid #1e293b', paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, letterSpacing: 4, color: '#f59e0b' }}>{nr}</span>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, fontWeight: 400, color: '#f1f5f9', margin: 0, letterSpacing: 1 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function BotProfielPage() {
  const { user } = useUser()
  const router = useRouter()
  const [answers, setAnswers] = useState<Answers>(empty)
  const [rolAnders, setRolAnders] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null)

  const [isDirty, setIsDirty] = useState(false)
  const firstName = user?.firstName || 'daar'

  useEffect(() => {
    fetch('/api/bot/profiel')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.profiel) {
          setAnswers(prev => ({ ...prev, ...data.profiel }))
          setIsFirstTime(false)
        } else {
          setIsFirstTime(true)
        }
      })
      .catch(() => {})
  }, [])

  function set(key: keyof Answers, val: string) {
    setAnswers(prev => ({ ...prev, [key]: val }))
    setIsDirty(true)
  }

  function toggleMarkt(val: string) {
    setAnswers(prev => ({
      ...prev,
      markt: prev.markt.includes(val) ? prev.markt.filter(v => v !== val) : [...prev.markt, val]
    }))
    setIsDirty(true)
  }

  const rolIngevuld = answers.rol && (answers.rol !== 'Anders' || rolAnders.trim().length > 1)

  const allFilled =
    rolIngevuld &&
    answers.markt.length > 0 &&
    answers.wat_verkoop_je.trim().length > 2 &&
    answers.ideale_klant.trim().length > 2 &&
    answers.uitdaging.trim().length > 2

  async function handleSubmit() {
    if (!allFilled) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/bot/profiel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiel: { ...answers, rol: answers.rol === 'Anders' ? rolAnders.trim() : answers.rol } }),
      })
      if (!res.ok) throw new Error('Opslaan mislukt')
      setIsDirty(false)
      router.push(answers.gebruik === 'team' ? '/bot/team' : '/bot')
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.')
      setSaving(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111827; color: #f1f5f9; font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 400; line-height: 30px; }
        textarea, input {
          background: #1f2937; color: #f1f5f9; border: 1.5px solid #374151;
          border-radius: 4px; font-family: 'Space Mono', monospace;
          font-size: 15px; font-weight: 400; padding: 12px 16px; width: 100%;
          box-sizing: border-box; outline: none; resize: vertical;
          transition: border-color 0.15s; line-height: 30px;
        }
        textarea:focus, input:focus { border-color: #f59e0b; }
        textarea::placeholder, input::placeholder { color: #4b5563; }
      `}</style>

      {isFirstTime === false && <BotNav active="profiel" />}
      {isFirstTime === true && (
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '0 clamp(20px, 4vw, 40px)', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(12px)',
        }}>
          <a href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, color: '#f1f5f9', textDecoration: 'none' }}>
            ARNO<span style={{ color: '#f59e0b' }}>BOT.</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 48, height: 3, background: '#4b5563', borderRadius: 2 }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2, color: '#6b7280' }}>VIDEO</span>
            </div>
            <div style={{ width: 16, height: 1, background: '#374151', marginBottom: 13 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 48, height: 3, background: '#f59e0b', borderRadius: 2 }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2, color: '#f59e0b' }}>PROFIEL</span>
            </div>
          </div>
        </nav>
      )}

      <div style={{ minHeight: '100vh', paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ maxWidth: 812, margin: '0 auto', padding: '60px 24px 0' }}>

          <div style={{ borderBottom: '3px solid #f59e0b', paddingBottom: 32, marginBottom: 48 }}>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 6, color: '#f59e0b', marginBottom: 8 }}>
              {isFirstTime ? 'WELKOM' : 'JOUW PROFIEL'}
            </p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, color: '#f1f5f9', lineHeight: 1.05, letterSpacing: 1, marginBottom: 24 }}>
              {isFirstTime ? `Goed dat je er bent, ${firstName}.` : 'Profiel aanpassen'}
            </h1>
            <div style={{ borderLeft: '4px solid #f59e0b', paddingLeft: 20, color: '#9ca3af', fontSize: 15, lineHeight: '30px' }}>
              <p style={{ color: '#f1f5f9', fontWeight: 400, marginBottom: 8 }}>ArnoBot stemt zijn coaching af op jouw situatie.</p>
              <p>Hoe meer hij weet over wie jij bent, wat je verkoopt en wat je uitdagingen zijn, hoe gerichter het advies. Wees bloedeerlijk; dit is jouw persoonlijke omgeving. Er kijkt niemand mee.</p>
            </div>
          </div>

          <Block nr="01" title="Wie ben je?">
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: '30px', color: '#9ca3af', marginBottom: 12 }}>Wat is je rol?</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ROL_OPTIONS.map(o => (
                <Chip key={o} label={o} selected={answers.rol === o} onClick={() => { set('rol', o); if (!HEEFT_TEAM.includes(o)) { set('teamgrootte', ''); set('gebruik', '') } }} />
              ))}
            </div>
            {answers.rol === 'Anders' && (
              <input
                value={rolAnders}
                onChange={e => setRolAnders(e.target.value)}
                placeholder="Jouw rol..."
                style={{ marginTop: 12 }}
              />
            )}
            {HEEFT_TEAM.includes(answers.rol) && (
              <>
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontSize: 15, fontWeight: 400, lineHeight: '30px', color: '#9ca3af', marginBottom: 12 }}>Gebruik je ArnoBot individueel of voor jouw team?</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <Chip label="INDIVIDUEEL" selected={answers.gebruik === 'individueel'} onClick={() => set('gebruik', 'individueel')} />
                    <Chip label="VOOR MIJN TEAM" selected={answers.gebruik === 'team'} onClick={() => set('gebruik', 'team')} />
                  </div>
                </div>
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontSize: 15, fontWeight: 400, lineHeight: '30px', color: '#9ca3af', marginBottom: 12 }}>Hoe groot is je sales team?</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {TEAMGROOTTE_OPTIONS.map(o => (
                      <Chip key={o} label={o} selected={answers.teamgrootte === o} onClick={() => set('teamgrootte', o)} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </Block>

          <Block nr="02" title="Jouw markt">
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: '30px', color: '#9ca3af', marginBottom: 12 }}>In welke markt ben je actief? <span style={{ color: '#4b5563' }}>(meerdere antwoorden mogelijk)</span></p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {MARKT_OPTIONS.map(o => (
                <Chip key={o} label={o} selected={answers.markt.includes(o)} onClick={() => toggleMarkt(o)} />
              ))}
            </div>
          </Block>

          <Block nr="03" title="Wat verkoop je?">
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: '30px', color: '#9ca3af', marginBottom: 12 }}>Omschrijf kort wat je verkoopt</p>
            <textarea
              value={answers.wat_verkoop_je}
              onChange={e => set('wat_verkoop_je', e.target.value)}
              placeholder="Bijv: Software voor HR-teams bij scale-ups, jaarcontracten van €15k–€40k..."
              rows={3}
            />
          </Block>

          <Block nr="04" title="Jouw ideale klant">
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: '30px', color: '#9ca3af', marginBottom: 12 }}>Wie is jouw ideale klant?</p>
            <textarea
              value={answers.ideale_klant}
              onChange={e => set('ideale_klant', e.target.value)}
              placeholder="Bijv: CFO's bij productiebedrijven met 50–200 medewerkers, beslissen op cijfers..."
              rows={3}
            />
          </Block>

          <Block nr="05" title="Jouw grootste uitdaging">
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: '30px', color: '#9ca3af', marginBottom: 12 }}>Wat houdt jou nu het meest bezig in je saleswerk?</p>
            <textarea
              value={answers.uitdaging}
              onChange={e => set('uitdaging', e.target.value)}
              placeholder="Bijv: Mijn conversie in het tweede gesprek is te laag, ik verlies deals op prijs..."
              rows={3}
            />
          </Block>

          <Block nr="06" title="Gemiddelde dealgrootte">
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: '30px', color: '#9ca3af', marginBottom: 12 }}>Wat is de gemiddelde waarde van een deal?</p>
            <input
              value={answers.dealgrootte}
              onChange={e => set('dealgrootte', e.target.value)}
              placeholder="Bijv: €15.000 — €40.000"
            />
          </Block>

          <Block nr="07" title="Salescyclus">
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: '30px', color: '#9ca3af', marginBottom: 12 }}>Hoe lang duurt een gemiddeld salestraject?</p>
            <input
              value={answers.salescyclus}
              onChange={e => set('salescyclus', e.target.value)}
              placeholder="Bijv: 2 tot 6 weken"
            />
          </Block>

          <Block nr="08" title="Target">
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: '30px', color: '#9ca3af', marginBottom: 12 }}>
              Verwacht je dit jaar je {getTargetLabel(answers.rol) ? `${getTargetLabel(answers.rol)} ` : ''}target te halen?
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {TARGET_DIT_JAAR_OPTIONS.map(o => (
                <Chip key={o} label={o} selected={answers.target_dit_jaar === o} onClick={() => set('target_dit_jaar', o)} />
              ))}
            </div>
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: '30px', color: '#9ca3af', marginBottom: 12 }}>
              Heb je de afgelopen 3 jaar je {getTargetLabel(answers.rol) ? `${getTargetLabel(answers.rol)} ` : ''}target gehaald?
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TARGET_3_JAAR_OPTIONS.map(o => (
                <Chip key={o} label={o} selected={answers.target_3_jaar === o} onClick={() => set('target_3_jaar', o)} />
              ))}
            </div>
          </Block>

          <Block nr="09" title="Jouw ervaring">
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: '30px', color: '#9ca3af', marginBottom: 12 }}>Hoe lang zit je al in sales?</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {JAREN_SALES_OPTIONS.map(o => (
                <Chip key={o} label={o} selected={answers.jaren_sales === o} onClick={() => set('jaren_sales', o)} />
              ))}
            </div>
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: '30px', color: '#9ca3af', marginBottom: 12 }}>Hoe lang doe je al de functie die je hierboven hebt aangegeven?</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {JAREN_FUNCTIE_OPTIONS.map(o => (
                <Chip key={o} label={o} selected={answers.jaren_functie === o} onClick={() => set('jaren_functie', o)} />
              ))}
            </div>
          </Block>

          {error && <p style={{ color: '#c0392b', fontSize: 15, fontWeight: 400, lineHeight: '30px', marginBottom: 16 }}>{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allFilled || saving}
            style={{
              padding: '12px 36px',
              background: allFilled ? '#f59e0b' : '#1e293b',
              color: allFilled ? '#f1f5f9' : '#374151',
              border: 'none', borderRadius: 999,
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 18, letterSpacing: 3,
              cursor: allFilled ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
              display: 'block', margin: '0 auto',
            }}
          >
            {saving ? 'Bezig...' : isFirstTime ? 'START ARNOBOT →' : 'PROFIEL OPSLAAN →'}
          </button>
        </div>
      </div>
    </>
  )
}
