'use client'

import { useState, useEffect, useCallback } from 'react'
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

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

function ArnobotBox({ text, onClose, style }: { text: string; onClose: () => void; style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', marginTop: '12px', borderLeft: '2px solid #EE7700', fontSize: '18px', lineHeight: 1.8, color: '#1a1714', opacity: 0.8, fontFamily: 'var(--font-space-mono, monospace)', backgroundColor: '#fdf6ec', padding: '12px 36px 12px 12px', ...style }}>
      <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '12px', background: 'none', border: 'none', color: '#EE7700', fontSize: '16px', cursor: 'pointer', padding: '0', lineHeight: 1 }} title="Sluiten">00d7</button>
      {text}
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────

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
        ? <textarea style={{ ...s.textarea, overflow: 'hidden' }} value={value}
            onChange={e => { onChange(id, e.target.value); autoResize(e.target) }}
            onInput={e => autoResize(e.currentTarget)}
            onBlur={() => onBlur(id)} placeholder="..." rows={3} />
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

// fix 18: KpiRow met monospace 18px label
function KpiRow({ id, label, value, onChange, onBlur, feedback, loading, onArnoBot }: FieldProps) {
  const hasAnswer = !!value.trim()
  return (
    <div style={{ marginBottom: '4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '16px', borderBottom: '1px solid #e0d8cc', padding: '10px 0' }}>
        {/* fix 18: monospace 18px */}
        <span style={{ ...MONO18, opacity: 0.5 }}>{label}</span>
        <input style={{ backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #e0d8cc', color: '#1a1714', fontSize: '18px', padding: '4px 0', outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', width: '100%', boxSizing: 'border-box' as const }} value={value} onChange={e => onChange(id, e.target.value)} onBlur={() => onBlur(id)} placeholder="..." />
      </div>
      {hasAnswer && (
        <button style={{ ...s.arnobotBtn, opacity: loading ? 0.4 : 0.7, marginLeft: '216px' }} onClick={() => !loading && onArnoBot(id, label, '')}>
          {loading ? '→ ARNOBOT DENKT...' : feedback ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
        </button>
      )}
      {feedback && !loading && <ArnobotBox text={feedback} onClose={() => onArnoBot(id, '__clear__', '')} style={{ marginLeft: '216px' }} />}
    </div>
  )
}

export default function UitvoeringPage() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saveStatus, setSaveStatus] = useState('')
  const [arnobotFeedback, setArnobotFeedback] = useState<Record<string, string>>({})
  const [arnobotLoading, setArnobotLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data } = await supabase.from('canvas_answers').select('question_id, answer').eq('user_id', user.id).in('question_id', ALL_FIELDS.map(f => `${PREFIX}_${f.id}`))
      if (data) {
        const map: Record<string, string> = {}
        data.forEach(r => { map[r.question_id.replace(`${PREFIX}_`, '')] = r.answer })
        setAnswers(map)
      }
    })()
  }, [user])

  const save = useCallback(async (id: string, value: string) => {
    if (!user) return
    setSaveStatus('OPSLAAN...')
    await supabase.from('canvas_answers').upsert({ user_id: user.id, question_id: `${PREFIX}_${id}`, answer: value }, { onConflict: 'user_id,question_id' })
    setSaveStatus('OPGESLAGEN ✓')
    setTimeout(() => setSaveStatus(''), 2000)
  }, [user])

  const handleChange = useCallback((id: string, value: string) => setAnswers(prev => ({ ...prev, [id]: value })), [])
  const handleBlur = useCallback((id: string) => setAnswers(prev => { save(id, prev[id] || ''); return prev }), [save])

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

  return (
    <main style={s.page}>
      {/* fix 13: nav Bebas 36px */}
      <nav style={s.nav}>
        <Link href="/canvas" style={{ color: '#1a1714', textDecoration: 'none', opacity: 0.4 }}>← CANVAS</Link>
        <span style={{ opacity: 0.2 }}>/</span>
        <span style={{ color: '#EE7700' }}>UITVOERING</span>
      </nav>

      <PageHero number={3} />

      {/* fix 14a+b: KWARTAALTHEMA — Bebas 26px labels, ArnoBot per veld */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <div style={{ ...s.groupLabel, marginBottom: '24px' }}>KWARTAALTHEMA<span style={s.fieldLabelLine} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '32px' }}>
          {(['kwartaal_jaar','themanaam','meetbaar_doel','cruciale_kpi'] as const).map(id => {
            const hasAnswer = !!answers[id]?.trim()
            return (
              <div key={id}>
                <div style={{ ...MONO18, opacity: 0.5, marginBottom: '8px' }}>{f(id).label}</div>
                <input style={s.input} value={answers[id] || ''} onChange={e => handleChange(id, e.target.value)} onBlur={() => handleBlur(id)} placeholder="..." />
                {/* fix 14b: ArnoBot */}
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

      {/* Fix 3: OKR — geen lijn, één blok met 3 kolommen elk 3 velden */}
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

      {/* Fix 4: KLANTEN blokken — nummers 1/2/3 in Monospace 18px */}
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
                      <textarea style={{ ...s.textarea, minHeight: '70px', overflow: 'hidden' }} value={value} onChange={e => { handleChange(id, e.target.value); autoResize(e.target) }} onInput={e => autoResize(e.currentTarget)} onBlur={() => handleBlur(id)} placeholder="..." rows={2} />
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

      {/* fix 17: AANTALLEN & CONVERSIES */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <div style={{ ...s.groupLabel, marginBottom: '32px' }}>AANTALLEN & CONVERSIES<span style={s.fieldLabelLine} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '24px', marginBottom: '32px' }}>
          {(['numbers_leads','numbers_bezoeken','numbers_offertes','numbers_orders','numbers_referrals'] as const).map(id => (
            <NumberCol key={id} {...fp(id)} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {(['conversie_leads_bezoeken','conversie_bezoeken_offertes','conversie_offertes_orders'] as const).map(id => (
            <NumberCol key={id} {...fp(id)} />
          ))}
        </div>
      </div>

      {/* fix 12: PAGINA 06 label verwijderd */}

      {/* WENSENLIJST */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <Field {...fp('wensenlijst')} />
      </div>

      {/* fix 18: KPI DASHBOARD */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <div style={{ ...s.groupLabel, marginBottom: '24px' }}>DOELEN EN KPI DASHBOARD<span style={s.fieldLabelLine} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 80px' }}>
          {(['kpi_verkoopcyclus','kpi_conversieratio','kpi_klantaandeel','kpi_klantretentie','kpi_forecast','kpi_ordergrootte','kpi_nieuwe_logos','kpi_omzet','kpi_winst','kpi_referrals'] as const).map(id => (
            <KpiRow key={id} {...fp(id)} />
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
