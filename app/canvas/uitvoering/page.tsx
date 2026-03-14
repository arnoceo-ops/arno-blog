// @ts-nocheck
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import { PageHero } from '@/components/canvas/PageHero'

type FieldType = 'textarea' | 'input'
interface FieldDef { id: string; label: string; sub: string; type: FieldType }

const PREFIX = 'uitvoering'

// fix 15: OKR subteksten aangepast
const ALL_FIELDS: FieldDef[] = [
  { id: 'kwartaal_jaar', label: 'Kwartaal / Jaar', sub: '', type: 'input' },
  { id: 'themanaam', label: 'Themanaam', sub: '', type: 'input' },
  { id: 'meetbaar_doel', label: 'Meetbaar doel', sub: '', type: 'input' },
  { id: 'cruciale_kpi', label: 'Cruciale KPI', sub: '', type: 'input' },
  { id: 'okr_wat_1', label: 'DOELSTELLING (WAT)', sub: 'Wat willen we bereiken?', type: 'textarea' },
  { id: 'okr_hoe_1', label: 'KERNRESULTAAT (HOE)', sub: 'Hoe weten we dat we het doel bereikt hebben?', type: 'textarea' },
  { id: 'okr_wie_1', label: 'OWNER', sub: 'Wie is verantwoordelijk voor het behalen van dit resultaat?', type: 'input' },
  { id: 'okr_wat_2', label: 'DOELSTELLING (WAT)', sub: 'Wat willen we bereiken?', type: 'textarea' },
  { id: 'okr_hoe_2', label: 'KERNRESULTAAT (HOE)', sub: 'Hoe weten we dat we het doel bereikt hebben?', type: 'textarea' },
  { id: 'okr_wie_2', label: 'OWNER', sub: 'Wie is verantwoordelijk voor het behalen van dit resultaat?', type: 'input' },
  { id: 'okr_wat_3', label: 'DOELSTELLING (WAT)', sub: 'Wat willen we bereiken?', type: 'textarea' },
  { id: 'okr_hoe_3', label: 'KERNRESULTAAT (HOE)', sub: 'Hoe weten we dat we het doel bereikt hebben?', type: 'textarea' },
  { id: 'okr_wie_3', label: 'OWNER', sub: 'Wie is verantwoordelijk voor het behalen van dit resultaat?', type: 'input' },
  { id: 'klanten_krijgen_1', label: '1', sub: '', type: 'textarea' },
  { id: 'klanten_krijgen_2', label: '2', sub: '', type: 'textarea' },
  { id: 'klanten_krijgen_3', label: '3', sub: '', type: 'textarea' },
  { id: 'klanten_uitbouwen_1', label: '1', sub: '', type: 'textarea' },
  { id: 'klanten_uitbouwen_2', label: '2', sub: '', type: 'textarea' },
  { id: 'klanten_uitbouwen_3', label: '3', sub: '', type: 'textarea' },
  { id: 'klanten_houden_1', label: '1', sub: '', type: 'textarea' },
  { id: 'klanten_houden_2', label: '2', sub: '', type: 'textarea' },
  { id: 'klanten_houden_3', label: '3', sub: '', type: 'textarea' },
  { id: 'numbers_leads', label: '# Leads', sub: '', type: 'input' },
  { id: 'numbers_bezoeken', label: '# Bezoeken', sub: '', type: 'input' },
  { id: 'numbers_offertes', label: '# Offertes', sub: '', type: 'input' },
  { id: 'numbers_orders', label: '# Orders', sub: '', type: 'input' },
  { id: 'numbers_referrals', label: '# Referrals', sub: '', type: 'input' },
  { id: 'conversie_leads_bezoeken', label: 'Bezoeken / Leads', sub: '', type: 'input' },
  { id: 'conversie_bezoeken_offertes', label: 'Offertes / Bezoeken', sub: '', type: 'input' },
  { id: 'conversie_offertes_orders', label: 'Orders / Offertes', sub: '', type: 'input' },
  { id: 'wensenlijst', label: 'WENSENLIJST', sub: "Nieuwe Logo's (Olifanten)", type: 'textarea' },
  { id: 'kpi_verkoopcyclus', label: 'Verkoopcyclus', sub: 'Doorlooptijd', type: 'input' },
  { id: 'kpi_conversieratio', label: 'Conversieratio', sub: '', type: 'input' },
  { id: 'kpi_klantaandeel', label: '% Klantaandeel', sub: '', type: 'input' },
  { id: 'kpi_klantretentie', label: '% Klantretentie', sub: '', type: 'input' },
  { id: 'kpi_forecast', label: '% Behaalde Forecast', sub: '', type: 'input' },
  { id: 'kpi_ordergrootte', label: '€ Gem. Ordergrootte', sub: '', type: 'input' },
  { id: 'kpi_nieuwe_logos', label: "# Nieuwe Logo's", sub: '', type: 'input' },
  { id: 'kpi_omzet', label: '€ Omzet', sub: '', type: 'input' },
  { id: 'kpi_winst', label: '€/% Winst', sub: '', type: 'input' },
  { id: 'kpi_referrals', label: '# Referrals', sub: '', type: 'input' },
  { id: 'verkoopproces', label: 'VERKOOPPROCES / KLANTREIS', sub: 'Hoe ziet ons verkoopproces er uit? Wat hebben we geleerd? Wat willen we verbeteren?', type: 'textarea' },
  { id: 'feestje', label: 'BOUW EEN FEESTJE', sub: 'Hoe vieren we onze successen?', type: 'textarea' },
  { id: 'beloning', label: 'BELONING', sub: 'Hoe belonen we betrokken medewerkers?', type: 'textarea' },
]

async function getArnoBotFeedback(label: string, sub: string, answer: string): Promise<string> {
  if (!answer.trim()) return 'Vul dit veld in voor ArnoBot feedback.'
  const res = await fetch('/api/arnobot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label, sub, answer }) })
  if (!res.ok) throw new Error('ArnoBot request failed')
  return (await res.json()).feedback
}

// ─── GEDEELDE STIJLCONSTANTEN ─────────────────────────────────────────
const BEBAS: React.CSSProperties = { fontFamily: 'var(--font-bebas), sans-serif', fontSize: '26px', letterSpacing: '3px', color: '#1a1714' }
const MONO18: React.CSSProperties = { fontFamily: 'var(--font-space-mono, monospace)', fontSize: '18px', color: '#1a1714' }
const MONO_SUB: React.CSSProperties = { ...MONO18, opacity: 0.5, marginBottom: '14px' }
const LINE: React.CSSProperties = { flex: 1, height: '1px', backgroundColor: '#e0d8cc' }


function AutoTextarea({ value, onChange, onBlur, style }: { value: string; onChange: (v: string) => void; onBlur: () => void; style?: React.CSSProperties }) {
  const setHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }
  return (
    <textarea
      ref={setHeight}
      style={{ ...style, overflow: 'hidden', resize: 'none' }}
      value={value}
      onInput={e => setHeight(e.currentTarget)}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder="..."
      rows={3}
    />
  )
}

function ArnobotBox({ text, onClose, style }: { text: string; onClose: () => void; style?: React.CSSProperties }) {
  return (
    <div style={{ marginTop: '12px', borderLeft: '2px solid #EE7700', fontSize: '18px', lineHeight: 1.8, color: '#1a1714', opacity: 0.8, fontFamily: 'var(--font-space-mono, monospace)', backgroundColor: '#fdf6ec', padding: '12px', ...style }}>
      {text}
      <button onClick={onClose} style={{ marginTop: '12px', display: 'block', background: 'none', border: 'none', color: '#EE7700', fontSize: '11px', letterSpacing: '2px', cursor: 'pointer', padding: '0' }}>
        {'→ SLUITEN'}
      </button>
    </div>
  )
}

const s = {
  page: { backgroundColor: '#f5f0e8', minHeight: '100vh', color: '#1a1714', fontFamily: 'var(--font-barlow, sans-serif)' } as React.CSSProperties,
  // fix 13: nav Bebas 36px
  nav: { display: 'flex', alignItems: 'center', gap: '16px', padding: '24px 48px', fontFamily: 'var(--font-bebas), sans-serif', fontSize: '36px', letterSpacing: '3px', borderBottom: '1px solid #e0d8cc' } as React.CSSProperties,
  sectionDivider: { borderTop: '1px solid #e0d8cc', padding: '48px 48px 0' } as React.CSSProperties,
  fieldLabel: { ...BEBAS, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' } as React.CSSProperties,
  fieldLabelLine: LINE,
  fieldSub: MONO_SUB,
  textarea: { width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #e0d8cc', color: '#1a1714', fontSize: '18px', padding: '12px 0', resize: 'none' as const, outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', lineHeight: 1.8, minHeight: '90px', boxSizing: 'border-box' as const },
  input: { width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #e0d8cc', color: '#1a1714', fontSize: '18px', padding: '10px 0', outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', boxSizing: 'border-box' as const },
  arnobotBtn: { marginTop: '8px', background: 'none', border: 'none', color: '#EE7700', fontSize: '11px', letterSpacing: '2px', cursor: 'pointer', padding: '0' } as React.CSSProperties,
  // fix 1: arnobotBox 18px
  arnobotBox: { marginTop: '12px', borderLeft: '2px solid #EE7700', paddingLeft: '12px', fontSize: '18px', lineHeight: 1.8, color: '#1a1714', opacity: 0.8, fontFamily: 'var(--font-space-mono, monospace)', backgroundColor: '#fdf6ec', padding: '12px' } as React.CSSProperties,
  saveStatus: { position: 'fixed' as const, bottom: '24px', right: '24px', fontSize: '11px', letterSpacing: '3px', color: '#EE7700', opacity: 0.8 },
  groupLabel: { ...BEBAS, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' } as React.CSSProperties,
  groupSub: MONO_SUB,
}

interface FieldProps {
  id: string; label: string; sub: string; type: FieldType
  value: string; onChange: (id: string, v: string) => void; onBlur: (id: string) => void
  feedback: string; loading: boolean; onArnoBot: (id: string, label: string, sub: string) => void
}

function Field({ id, label, sub, type, value, onChange, onBlur, feedback, loading, onArnoBot }: FieldProps) {
  const hasAnswer = !!value.trim()
  return (
    <div>
      <div style={s.fieldLabel}>{label}<span style={s.fieldLabelLine} /></div>
      {sub && <div style={s.fieldSub}>{sub}</div>}
      {type === 'textarea'
        ? <AutoTextarea style={s.textarea} value={value} onChange={v => onChange(id, v)} onBlur={() => onBlur(id)} />
        : <input style={s.input} value={value} onChange={e => onChange(id, e.target.value)} onBlur={() => onBlur(id)} placeholder="..." />
      }
      {hasAnswer && (
        <button style={{ ...s.arnobotBtn, opacity: loading ? 0.4 : 0.7 }} onClick={() => !loading && onArnoBot(id, label, sub)}>
          {loading ? '→ ARNOBOT DENKT...' : feedback ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
        </button>
      )}
      {feedback && !loading && <ArnobotBox text={feedback} onClose={() => onArnoBot(id, '__clear__', '')} />}
    </div>
  )
}

// Fix 3: OKR kolom — titel Bebas 26px, subtekst Mono 18px, 3 genummerde invoervelden
function OkrCol({ title, sub, prefix, answers, arnobotFeedback, arnobotLoading, handleChange, handleBlur, handleArnoBot }: {
  title: string; sub: string; prefix: string
  answers: Record<string, string>
  arnobotFeedback: Record<string, string>
  arnobotLoading: Record<string, boolean>
  handleChange: (id: string, v: string) => void
  handleBlur: (id: string) => void
  handleArnoBot: (id: string, label: string, sub: string) => void
}) {
  return (
    <div>
      <div style={{ ...BEBAS, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>{title}<span style={LINE} /></div>
      <div style={MONO_SUB}>{sub}</div>
      {[1,2,3].map(i => {
        const id = `${prefix}_${i}`
        const value = answers[id] || ''
        const hasAnswer = !!value.trim()
        return (
          <div key={id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: '10px', alignItems: 'center' }}>
              <span style={{ ...MONO18, opacity: 0.4 }}>{i}</span>
              <input style={{ backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #e0d8cc', color: '#1a1714', fontSize: '18px', padding: '8px 0', outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', width: '100%', boxSizing: 'border-box' as const }}
                value={value} onChange={e => handleChange(id, e.target.value)} onBlur={() => handleBlur(id)} placeholder="..." />
            </div>
            {hasAnswer && (
              <button style={{ ...s.arnobotBtn, opacity: arnobotLoading[id] ? 0.4 : 0.7, marginLeft: '34px' }}
                onClick={() => !arnobotLoading[id] && handleArnoBot(id, `${title} ${i}`, sub)}>
                {arnobotLoading[id] ? '→ ARNOBOT DENKT...' : arnobotFeedback[id] ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
              </button>
            )}
            {arnobotFeedback[id] && !arnobotLoading[id] && <ArnobotBox text={arnobotFeedback[id]} onClose={() => handleArnoBot(id, '__clear__', '')} style={{ marginLeft: '34px' }} />}
          </div>
        )
      })}
    </div>
  )
}

// fix 17: NumberCol met monospace 18px label
function NumberCol({ id, label, value, onChange, onBlur, feedback, loading, onArnoBot }: FieldProps) {
  const hasAnswer = !!value.trim()
  return (
    <div style={{ borderTop: '1px solid #e0d8cc', paddingTop: '16px' }}>
      {/* fix 17: monospace 18px */}
      <div style={{ ...MONO18, opacity: 0.6, marginBottom: '12px' }}>{label}</div>
      <input style={s.input} value={value} onChange={e => onChange(id, e.target.value)} onBlur={() => onBlur(id)} placeholder="..." />
      {hasAnswer && (
        <button style={{ ...s.arnobotBtn, opacity: loading ? 0.4 : 0.7 }} onClick={() => !loading && onArnoBot(id, label, '')}>
          {loading ? '→ ARNOBOT DENKT...' : feedback ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
        </button>
      )}
      {feedback && !loading && <ArnobotBox text={feedback} onClose={() => onArnoBot(id, '__clear__', '')} />}
    </div>
  )
}


// ─── TRAFFIC LIGHT HELPERS ────────────────────────────────────────────
function trafficLight(value: number, red: number, green: number): string {
  if (value <= red) return '#e53e3e'
  if (value >= green) return '#38a169'
  return '#dd8800'
}

function TrafficDot({ color }: { color: string }) {
  return (
    <div style={{
      width: '12px', height: '12px', borderRadius: '50%',
      backgroundColor: color, flexShrink: 0,
      boxShadow: `0 0 6px ${color}88`,
    }} />
  )
}

// KpiRow met traffic light + doelstelling / realisatie
function KpiRowWithLight({ id, label, feedback, loading, onArnoBot, doelVal, realVal, onDoelChange, onRealChange, onDoelBlur, onRealBlur }: Omit<FieldProps, 'value' | 'onChange' | 'onBlur' | 'type' | 'sub'> & {
  doelVal: string; realVal: string
  onDoelChange: (v: string) => void; onRealChange: (v: string) => void
  onDoelBlur: () => void; onRealBlur: () => void
}) {
  const hasAnswer = !!realVal.trim()
  const doel = parseFloat(doelVal.replace(',', '.'))
  const real = parseFloat(realVal.replace(',', '.'))
  const hasLight = !isNaN(doel) && !isNaN(real) && doel > 0
  const pct = hasLight ? (real / doel) * 100 : null
  const color = pct === null ? '#444' : pct > 100 ? '#38a169' : pct === 100 ? '#dd8800' : '#e53e3e'
  const inputStyle = { backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #e0d8cc', color: '#1a1714', fontSize: '18px', padding: '4px 0', outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', width: '100%', boxSizing: 'border-box' as const }

  return (
    <div style={{ marginBottom: '4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '12px 1fr 1fr 1fr', alignItems: 'center', gap: '16px', borderBottom: '1px solid #e0d8cc', padding: '10px 0' }}>
        <TrafficDot color={color} />
        <span style={{ ...MONO18, opacity: 0.5 }}>{label}</span>
        <input style={inputStyle} value={doelVal} onChange={e => onDoelChange(e.target.value)} onBlur={onDoelBlur} placeholder="doelstelling..." />
        <input style={inputStyle} value={realVal} onChange={e => onRealChange(e.target.value)} onBlur={onRealBlur} placeholder="realisatie..." />
      </div>
      {hasAnswer && (
        <button style={{ ...s.arnobotBtn, opacity: loading ? 0.4 : 0.7, marginLeft: '28px' }} onClick={() => !loading && onArnoBot(id, label, '')}>
          {loading ? '→ ARNOBOT DENKT...' : feedback ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
        </button>
      )}
      {feedback && !loading && <ArnobotBox text={feedback} onClose={() => onArnoBot(id, '__clear__', '')} style={{ marginLeft: '28px' }} />}
    </div>
  )
}

// Conversie berekend met traffic light
function ConversieRow({ label, value, redBelow, greenAbove }: { label: string; value: number | null; redBelow: number; greenAbove: number }) {
  const color = value === null ? '#444' : trafficLight(value, redBelow, greenAbove)
  const display = value === null ? '—' : `${Math.round(value)}%`
  return (
    <div style={{ borderTop: '1px solid #e0d8cc', paddingTop: '16px' }}>
      <div style={{ ...MONO18, opacity: 0.6, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <TrafficDot color={color} />
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '36px', color, letterSpacing: '2px' }}>
        {display}
      </div>
      <div style={{ fontSize: '11px', fontFamily: 'var(--font-space-mono, monospace)', opacity: 0.35, marginTop: '4px' }}>
        rood &lt;{redBelow}% · groen &gt;{greenAbove}%
      </div>
    </div>
  )
}


const KPI_IDS = ['kpi_verkoopcyclus','kpi_conversieratio','kpi_klantaandeel','kpi_klantretentie','kpi_forecast','kpi_ordergrootte','kpi_nieuwe_logos','kpi_omzet','kpi_winst','kpi_referrals'] as const

export default function UitvoeringPage() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [kpiTargets, setKpiTargets] = useState<Record<string, { doel: string; real: string }>>({})
  const [saveStatus, setSaveStatus] = useState('')
  const [arnobotFeedback, setArnobotFeedback] = useState<Record<string, string>>({})
  const [arnobotLoading, setArnobotLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data } = await supabase.from('canvas_answers').select('question_id, answer').eq('user_id', user.id).like('question_id', `${PREFIX}_%`)
      if (data) {
        const map: Record<string, string> = {}
        const limits: Record<string, { min: string; max: string }> = {}
        data.forEach(r => {
          const key = r.question_id.slice(PREFIX.length + 1)
          if (key.endsWith('_doel') || key.endsWith('_real')) {
            const base = key.slice(0, key.lastIndexOf('_'))
            const type = key.slice(key.lastIndexOf('_') + 1) as 'doel' | 'real'
            if (!limits[base]) limits[base] = { doel: '', real: '' }
            limits[base][type] = r.answer
          } else {
            map[key] = r.answer
          }
        })
        setAnswers(map)
        setKpiTargets(limits)
      }
    })()
  }, [user])

  const save = useCallback(async (id: string, value: string) => {
    if (!user) return
    setSaveStatus('OPSLAAN...')
    const { error } = await supabase.from('canvas_answers').upsert(
      { user_id: user.id, question_id: `${PREFIX}_${id}`, answer: value },
      { onConflict: 'user_id,question_id' }
    )
    if (error) { console.error('SAVE ERROR:', error.code, error.message); setSaveStatus('FOUT ✗'); return }
    setSaveStatus('OPGESLAGEN ✓')
    setTimeout(() => setSaveStatus(''), 2000)
  }, [user])

  const handleChange = useCallback((id: string, value: string) => setAnswers(prev => ({ ...prev, [id]: value })), [])
  const answersRef = useRef(answers)
  useEffect(() => { answersRef.current = answers }, [answers])
  const handleBlur = useCallback((id: string) => { save(id, answersRef.current[id] || '') }, [save])

  const handleTargetChange = useCallback((kpiId: string, type: 'doel' | 'real', value: string) => {
    setKpiTargets(prev => ({ ...prev, [kpiId]: { ...prev[kpiId], [type]: value } }))
  }, [])
  const kpiTargetsRef = useRef(kpiTargets)
  useEffect(() => { kpiTargetsRef.current = kpiTargets }, [kpiTargets])
  const handleTargetBlur = useCallback((kpiId: string, type: 'doel' | 'real') => {
    save(`${kpiId}_${type}`, kpiTargetsRef.current[kpiId]?.[type] || '')
  }, [save])

  const handleArnoBot = useCallback((id: string, label: string, sub: string) => {
    if (label === '__clear__') { setArnobotFeedback(f => ({ ...f, [id]: '' })); return }
    setAnswers(prev => {
      const answer = prev[id] || ''
      setArnobotLoading(l => ({ ...l, [id]: true }))
      setArnobotFeedback(f => ({ ...f, [id]: '' }))
      getArnoBotFeedback(label, sub, answer)
        .then(fb => setArnobotFeedback(f => ({ ...f, [id]: fb })))
        .catch(() => setArnobotFeedback(f => ({ ...f, [id]: 'ArnoBot is tijdelijk niet beschikbaar.' })))
        .finally(() => setArnobotLoading(l => ({ ...l, [id]: false })))
      return prev
    })
  }, [])

  const fp = (id: string): FieldProps => ({
    id,
    label: ALL_FIELDS.find(x => x.id === id)?.label ?? id,
    sub: ALL_FIELDS.find(x => x.id === id)?.sub ?? '',
    type: ALL_FIELDS.find(x => x.id === id)?.type ?? 'input',
    value: answers[id] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    feedback: arnobotFeedback[id] || '',
    loading: arnobotLoading[id] || false,
    onArnoBot: handleArnoBot,
  })

  const f = (id: string) => ALL_FIELDS.find(x => x.id === id)!

  // Bereken conversies
  const leads = parseFloat(answers['numbers_leads'] || '0')
  const bezoeken = parseFloat(answers['numbers_bezoeken'] || '0')
  const offertes = parseFloat(answers['numbers_offertes'] || '0')
  const orders = parseFloat(answers['numbers_orders'] || '0')
  const conv1 = leads > 0 ? (bezoeken / leads) * 100 : null
  const conv2 = bezoeken > 0 ? (offertes / bezoeken) * 100 : null
  const conv3 = offertes > 0 ? (orders / offertes) * 100 : null

  return (
    <main style={s.page}>
      <nav style={s.nav}>
        <Link href="/canvas" style={{ color: '#1a1714', textDecoration: 'none', opacity: 0.4 }}>← CANVAS</Link>
        <span style={{ opacity: 0.2 }}>/</span>
        <span style={{ color: '#EE7700' }}>UITVOERING</span>
      </nav>

      <PageHero number={3} />

      {/* KWARTAALTHEMA */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <div style={{ ...s.groupLabel, marginBottom: '24px' }}>KWARTAALTHEMA<span style={s.fieldLabelLine} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '32px' }}>
          {(['kwartaal_jaar','themanaam','meetbaar_doel','cruciale_kpi'] as const).map(id => {
            const hasAnswer = !!answers[id]?.trim()
            return (
              <div key={id}>
                <div style={{ ...MONO18, opacity: 0.5, marginBottom: '8px' }}>{f(id).label}</div>
                <input style={s.input} value={answers[id] || ''} onChange={e => handleChange(id, e.target.value)} onBlur={() => handleBlur(id)} placeholder="..." />
                {hasAnswer && (
                  <button style={{ ...s.arnobotBtn, opacity: arnobotLoading[id] ? 0.4 : 0.7 }} onClick={() => !arnobotLoading[id] && handleArnoBot(id, f(id).label, '')}>
                    {arnobotLoading[id] ? '→ ARNOBOT DENKT...' : arnobotFeedback[id] ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
                  </button>
                )}
                {arnobotFeedback[id] && !arnobotLoading[id] && <ArnobotBox text={arnobotFeedback[id]} onClose={() => handleArnoBot(id, '__clear__', '')} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* OKR */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <div style={{ ...s.groupLabel, marginBottom: '32px' }}>OKR'S — DOELSTELLINGEN<span style={s.fieldLabelLine} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px' }}>
          <OkrCol title="DOELSTELLING (WAT)" sub="Wat willen we bereiken?" prefix="okr_wat"
            answers={answers} arnobotFeedback={arnobotFeedback} arnobotLoading={arnobotLoading}
            handleChange={handleChange} handleBlur={handleBlur} handleArnoBot={handleArnoBot} />
          <OkrCol title="KERNRESULTAAT (HOE)" sub="Hoe weten we dat we het doel bereikt hebben?" prefix="okr_hoe"
            answers={answers} arnobotFeedback={arnobotFeedback} arnobotLoading={arnobotLoading}
            handleChange={handleChange} handleBlur={handleBlur} handleArnoBot={handleArnoBot} />
          <OkrCol title="OWNER (WIE)" sub="Wie is verantwoordelijk voor het behalen van dit resultaat?" prefix="okr_wie"
            answers={answers} arnobotFeedback={arnobotFeedback} arnobotLoading={arnobotLoading}
            handleChange={handleChange} handleBlur={handleBlur} handleArnoBot={handleArnoBot} />
        </div>
      </div>

      {/* KLANTEN */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', paddingBottom: '48px' }}>
        {[
          { key: 'krijgen', label: 'KLANTEN KRIJGEN', sub: 'Effectieve leadgeneratie' },
          { key: 'uitbouwen', label: 'KLANTEN UITBOUWEN', sub: '100% klantaandeel' },
          { key: 'houden', label: 'KLANTEN BEHOUDEN', sub: 'Levenslange retentie' },
        ].map(({ key, label, sub }) => (
          <div key={key}>
            <div style={{ ...s.groupLabel, marginBottom: '4px' }}>{label}<span style={s.fieldLabelLine} /></div>
            <div style={{ ...MONO_SUB, marginBottom: '24px' }}>{sub}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1,2,3].map(n => {
                const id = `klanten_${key}_${n}`
                const value = answers[id] || ''
                const hasAnswer = !!value.trim()
                return (
                  <div key={id}>
                    <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ ...MONO18, opacity: 0.4, paddingTop: '10px' }}>{n}</span>
                      <AutoTextarea style={{ ...s.textarea, minHeight: '70px' }} value={value} onChange={v => handleChange(id, v)} onBlur={() => handleBlur(id)} />
                    </div>
                    {hasAnswer && (
                      <button style={{ ...s.arnobotBtn, opacity: arnobotLoading[id] ? 0.4 : 0.7, marginLeft: '34px' }}
                        onClick={() => !arnobotLoading[id] && handleArnoBot(id, `${label} ${n}`, '')}>
                        {arnobotLoading[id] ? '→ ARNOBOT DENKT...' : arnobotFeedback[id] ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
                      </button>
                    )}
                    {arnobotFeedback[id] && !arnobotLoading[id] && <ArnobotBox text={arnobotFeedback[id]} onClose={() => handleArnoBot(id, '__clear__', '')} style={{ marginLeft: '34px' }} />}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* AANTALLEN */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <div style={{ ...s.groupLabel, marginBottom: '32px' }}>AANTALLEN & CONVERSIES<span style={s.fieldLabelLine} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '24px', marginBottom: '40px' }}>
          {(['numbers_leads','numbers_bezoeken','numbers_offertes','numbers_orders','numbers_referrals'] as const).map(id => (
            <NumberCol key={id} {...fp(id)} />
          ))}
        </div>
        {/* Berekende conversies */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <ConversieRow label="Bezoeken / Leads" value={conv1} redBelow={20} greenAbove={40} />
          <ConversieRow label="Offertes / Bezoeken" value={conv2} redBelow={30} greenAbove={50} />
          <ConversieRow label="Orders / Offertes" value={conv3} redBelow={30} greenAbove={50} />
        </div>
      </div>

      {/* WENSENLIJST */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <Field {...fp('wensenlijst')} />
      </div>

      {/* KPI DASHBOARD */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <div style={{ ...s.groupLabel, marginBottom: '8px' }}>DOELEN EN KPI DASHBOARD<span style={s.fieldLabelLine} /></div>
        <div style={{ ...MONO_SUB, marginBottom: '24px', display: 'grid', gridTemplateColumns: '12px 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
          <span />
          <span style={{ opacity: 0.4, fontSize: '11px', letterSpacing: '2px' }}>KPI</span>
          <span style={{ opacity: 0.4, fontSize: '11px', letterSpacing: '2px' }}>DOELSTELLING</span>
          <span style={{ opacity: 0.4, fontSize: '11px', letterSpacing: '2px' }}>REALISATIE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 80px' }}>
          {KPI_IDS.map(id => (
            <KpiRowWithLight
              key={id}
              id={id}
              label={ALL_FIELDS.find(x => x.id === id)?.label ?? id}
              feedback={arnobotFeedback[id] || ''}
              loading={arnobotLoading[id] || false}
              onArnoBot={handleArnoBot}
              doelVal={kpiTargets[id]?.doel || ''}
              realVal={kpiTargets[id]?.real || ''}
              onDoelChange={v => handleTargetChange(id, 'doel', v)}
              onRealChange={v => handleTargetChange(id, 'real', v)}
              onDoelBlur={() => handleTargetBlur(id, 'doel')}
              onRealBlur={() => handleTargetBlur(id, 'real')}
            />
          ))}
        </div>
      </div>

      {/* VERKOOPPROCES */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <Field {...fp('verkoopproces')} />
      </div>

      {/* FEESTJE + BELONING */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', paddingBottom: '80px' }}>
        <Field {...fp('feestje')} />
        <Field {...fp('beloning')} />
      </div>

      {saveStatus && <p style={s.saveStatus}>{saveStatus}</p>}
    </main>
  )
}
