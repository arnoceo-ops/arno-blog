'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

type FieldType = 'textarea' | 'input'

interface FieldDef {
  id: string
  label: string
  sub: string
  type: FieldType
}

const PREFIX = 'mensen'

const ALL_FIELDS: FieldDef[] = [
  { id: 'aantrekkingskracht', label: 'AANTREKKINGSKRACHT', sub: 'Waarom werken mensen voor ons?', type: 'textarea' },
  { id: 'profielen', label: 'PROFIELEN', sub: 'Welke salesprofielen hebben we nodig om onze strategie te laten slagen?', type: 'textarea' },
  { id: 'wervingskanalen', label: 'WERVINGSKANALEN', sub: 'Via welke kanalen vinden we de beste verkopers?', type: 'textarea' },
  { id: 'selectieproces', label: 'SELECTIEPROCES', sub: 'Hoe krijgen we toptalent aan boord?', type: 'textarea' },
  { id: 'behoud_sterspelers', label: 'BEHOUD VAN STERSPELERS', sub: 'Hoe houden we sterspelers binnen de gelederen?', type: 'textarea' },
  { id: 'verkopers_q1', label: 'Q1', sub: '', type: 'input' },
  { id: 'verkopers_q2', label: 'Q2', sub: '', type: 'input' },
  { id: 'verkopers_q3', label: 'Q3', sub: '', type: 'input' },
  { id: 'verkopers_q4', label: 'Q4', sub: '', type: 'input' },
  { id: 'werving_selectie', label: 'WERVING EN SELECTIE', sub: 'Hoeveel tijd beslaat het proces van vacature tot eerste werkdag?', type: 'textarea' },
  { id: 'onboarding', label: 'ONBOARDING', sub: 'Binnen hoeveel maanden realiseert een verkoper 100% van de doelstelling?', type: 'textarea' },
  { id: 'tijd_rendement', label: 'TIJD TOT VOLLEDIG RENDEMENT', sub: 'Hoeveel tijd van vacature tot 100% doelstelling?', type: 'textarea' },
  { id: 'actieplan', label: 'ACTIEPLAN', sub: 'Concrete acties mensen & capaciteit', type: 'textarea' },
]

async function getArnoBotFeedback(label: string, sub: string, answer: string): Promise<string> {
  if (!answer.trim()) return 'Vul dit veld in voor ArnoBot feedback.'
  const response = await fetch('/api/arnobot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, sub, answer }),
  })
  if (!response.ok) throw new Error('ArnoBot request failed')
  const data = await response.json()
  return data.feedback
}

const s = {
  page: { backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#f0ede6', fontFamily: 'var(--font-barlow, sans-serif)' } as React.CSSProperties,
  nav: { display: 'flex', alignItems: 'center', gap: '16px', padding: '24px 48px', fontSize: '11px', letterSpacing: '3px', borderBottom: '1px solid #1a1a1a' } as React.CSSProperties,
  pageHeader: { padding: '48px 48px 0', marginBottom: '64px' } as React.CSSProperties,
  pageTag: { color: '#EE7700', fontSize: '11px', letterSpacing: '4px', marginBottom: '8px', opacity: 0.7 } as React.CSSProperties,
  pageTitle: { fontFamily: 'var(--font-bebas), sans-serif', fontSize: '80px', letterSpacing: '6px', color: '#f0ede6', margin: 0, lineHeight: 1 } as React.CSSProperties,
  sectionDivider: { borderTop: '1px solid #1e1e1e', padding: '48px 48px 0' } as React.CSSProperties,
  fieldLabel: { fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: '#f0ede6', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' } as React.CSSProperties,
  fieldLabelLine: { flex: 1, height: '1px', backgroundColor: '#222' } as React.CSSProperties,
  fieldSub: { fontSize: '12px', color: '#f0ede6', opacity: 0.35, marginBottom: '12px' } as React.CSSProperties,
  textarea: { width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #1e1e1e', color: '#f0ede6', fontSize: '14px', padding: '12px 0', resize: 'none' as const, outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', lineHeight: 1.7, minHeight: '100px', boxSizing: 'border-box' as const },
  input: { width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #1e1e1e', color: '#f0ede6', fontSize: '14px', padding: '10px 0', outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', boxSizing: 'border-box' as const },
  arnobotBtn: { marginTop: '8px', background: 'none', border: 'none', color: '#EE7700', fontSize: '10px', letterSpacing: '2px', cursor: 'pointer', padding: '0' } as React.CSSProperties,
  arnobotBox: { marginTop: '12px', borderLeft: '2px solid #EE7700', paddingLeft: '12px', fontSize: '12px', lineHeight: 1.7, color: '#f0ede6', opacity: 0.7, fontFamily: 'var(--font-space-mono, monospace)' } as React.CSSProperties,
  saveStatus: { position: 'fixed' as const, bottom: '24px', right: '24px', fontSize: '10px', letterSpacing: '3px', color: '#EE7700', opacity: 0.6 },
  groupLabel: { fontSize: '11px', fontWeight: 700, letterSpacing: '4px', color: '#EE7700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' } as React.CSSProperties,
  groupSub: { fontSize: '11px', color: '#f0ede6', opacity: 0.35, letterSpacing: '1px', fontWeight: 400 } as React.CSSProperties,
}

interface FieldProps {
  id: string
  label: string
  sub: string
  type: FieldType
  value: string
  onChange: (id: string, value: string) => void
  onBlur: (id: string) => void
  feedback: string
  loading: boolean
  onArnoBot: (id: string, label: string, sub: string) => void
}

function Field({ id, label, sub, type, value, onChange, onBlur, feedback, loading, onArnoBot }: FieldProps) {
  const hasAnswer = !!value.trim()
  return (
    <div>
      <div style={s.fieldLabel}>
        {label}
        <span style={s.fieldLabelLine} />
      </div>
      {sub && <div style={s.fieldSub}>{sub}</div>}
      {type === 'textarea'
        ? <textarea style={s.textarea} value={value} onChange={e => onChange(id, e.target.value)} onBlur={() => onBlur(id)} placeholder="..." rows={4} />
        : <input style={s.input} value={value} onChange={e => onChange(id, e.target.value)} onBlur={() => onBlur(id)} placeholder="..." />
      }
      {hasAnswer && (
        <button style={{ ...s.arnobotBtn, opacity: loading ? 0.2 : 0.4 }} onClick={() => !loading && onArnoBot(id, label, sub)}>
          {loading ? '→ ARNOBOT DENKT...' : feedback ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
        </button>
      )}
      {feedback && !loading && <div style={s.arnobotBox}>{feedback}</div>}
    </div>
  )
}

interface QuarterBlockProps {
  quarter: string
  ids: { verkopers: string; blijven: string; uitbreiding: string; nieuwe: string }
  answers: Record<string, string>
  onChange: (id: string, value: string) => void
  onBlur: (id: string) => void
}

function QuarterBlock({ quarter, ids, answers, onChange, onBlur }: QuarterBlockProps) {
  const row = (label: string, id: string) => (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1a1a1a', padding: '8px 0' }}>
      <span style={{ fontSize: '12px', color: '#f0ede6', opacity: 0.4 }}>{label}</span>
      <input style={{ backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #1e1e1e', color: '#f0ede6', fontSize: '13px', padding: '4px 0', outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', width: '100%', boxSizing: 'border-box' as const }} value={answers[id] || ''} onChange={e => onChange(id, e.target.value)} onBlur={() => onBlur(id)} placeholder="—" />
    </div>
  )
  return (
    <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: '#EE7700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {quarter}
        <span style={{ flex: 1, height: '1px', backgroundColor: '#1e1e1e' }} />
      </div>
      {row('# verkopers', ids.verkopers)}
      {row('# die blijven', ids.blijven)}
      {row('# uitbreiding', ids.uitbreiding)}
      {row('# nieuwe sales', ids.nieuwe)}
    </div>
  )
}

export default function MensenPage() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saveStatus, setSaveStatus] = useState('')
  const [arnobotFeedback, setArnobotFeedback] = useState<Record<string, string>>({})
  const [arnobotLoading, setArnobotLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data } = await supabase
        .from('canvas_answers')
        .select('question_id, answer')
        .eq('user_id', user.id)
        .in('question_id', ALL_FIELDS.map(f => `${PREFIX}_${f.id}`))
      if (data) {
        const map: Record<string, string> = {}
        data.forEach(row => { map[row.question_id.replace(`${PREFIX}_`, '')] = row.answer })
        setAnswers(map)
      }
    }
    load()
  }, [user])

  const save = useCallback(async (id: string, value: string) => {
    if (!user) return
    setSaveStatus('OPSLAAN...')
    await supabase.from('canvas_answers').upsert({
      user_id: user.id,
      question_id: `${PREFIX}_${id}`,
      answer: value,
    }, { onConflict: 'user_id,question_id' })
    setSaveStatus('OPGESLAGEN ✓')
    setTimeout(() => setSaveStatus(''), 2000)
  }, [user])

  const handleChange = useCallback((id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }, [])

  const handleBlur = useCallback((id: string) => {
    setAnswers(prev => {
      save(id, prev[id] || '')
      return prev
    })
  }, [save])

  const handleArnoBot = useCallback(async (id: string, label: string, sub: string) => {
    setAnswers(prev => {
      const answer = prev[id] || ''
      setArnobotLoading(l => ({ ...l, [id]: true }))
      setArnobotFeedback(f => ({ ...f, [id]: '' }))
      getArnoBotFeedback(label, sub, answer)
        .then(feedback => setArnobotFeedback(f => ({ ...f, [id]: feedback })))
        .catch(() => setArnobotFeedback(f => ({ ...f, [id]: 'ArnoBot is tijdelijk niet beschikbaar.' })))
        .finally(() => setArnobotLoading(l => ({ ...l, [id]: false })))
      return prev
    })
  }, [])

  const fp = (id: string) => ({
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
      <nav style={s.nav}>
        <Link href="/canvas" style={{ color: '#f0ede6', textDecoration: 'none', opacity: 0.4 }}>← CANVAS</Link>
        <span style={{ opacity: 0.2 }}>/</span>
        <span style={{ color: '#EE7700' }}>MENSEN</span>
      </nav>

      <div style={s.pageHeader}>
        <p style={s.pageTag}>03 — 04</p>
        <h1 style={s.pageTitle}>MENSEN</h1>
      </div>

      {/* PAGINA 3 */}

      {/* ROW 1: Aantrekkingskracht (breed) + Profielen */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', paddingBottom: '48px' }}>
        <Field {...f('aantrekkingskracht')} {...fp('aantrekkingskracht')} />
        <Field {...f('profielen')} {...fp('profielen')} />
      </div>

      {/* ROW 2: Wervingskanalen / Selectieproces / Behoud sterspelers */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', paddingBottom: '64px' }}>
        <Field {...f('wervingskanalen')} {...fp('wervingskanalen')} />
        <Field {...f('selectieproces')} {...fp('selectieproces')} />
        <Field {...f('behoud_sterspelers')} {...fp('behoud_sterspelers')} />
      </div>

      {/* PAGINA 4 */}
      <div style={{ ...s.sectionDivider, borderTop: '2px solid #EE7700', paddingBottom: '0' }}>
        <p style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '4px', opacity: 0.6, margin: '0 0 40px' }}>PAGINA 04 — CAPACITEIT & ACTIEPLAN</p>
      </div>

      {/* ROW 3: Benodigde capaciteit Q1-Q4 */}
      <div style={{ padding: '0 48px 48px', borderTop: '1px solid #1e1e1e' }}>
        <div style={{ ...s.groupLabel, marginTop: '48px' }}>
          BENODIGDE CAPACITEIT
          <span style={s.groupSub}>Hoeveel verkopers hebben we nodig om het jaardoel te halen?</span>
          <span style={s.fieldLabelLine} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
          <QuarterBlock
            quarter="Q1"
            ids={{ verkopers: 'verkopers_q1_aantal', blijven: 'verkopers_q1_blijven', uitbreiding: 'verkopers_q1_uitbreiding', nieuwe: 'verkopers_q1_nieuw' }}
            answers={answers} onChange={handleChange} onBlur={handleBlur}
          />
          <QuarterBlock
            quarter="Q2"
            ids={{ verkopers: 'verkopers_q2_aantal', blijven: 'verkopers_q2_blijven', uitbreiding: 'verkopers_q2_uitbreiding', nieuwe: 'verkopers_q2_nieuw' }}
            answers={answers} onChange={handleChange} onBlur={handleBlur}
          />
          <QuarterBlock
            quarter="Q3"
            ids={{ verkopers: 'verkopers_q3_aantal', blijven: 'verkopers_q3_blijven', uitbreiding: 'verkopers_q3_uitbreiding', nieuwe: 'verkopers_q3_nieuw' }}
            answers={answers} onChange={handleChange} onBlur={handleBlur}
          />
          <QuarterBlock
            quarter="Q4"
            ids={{ verkopers: 'verkopers_q4_aantal', blijven: 'verkopers_q4_blijven', uitbreiding: 'verkopers_q4_uitbreiding', nieuwe: 'verkopers_q4_nieuw' }}
            answers={answers} onChange={handleChange} onBlur={handleBlur}
          />
        </div>
      </div>

      {/* ROW 4: Werving & Selectie / Onboarding */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', paddingBottom: '48px' }}>
        <Field {...f('werving_selectie')} {...fp('werving_selectie')} />
        <Field {...f('onboarding')} {...fp('onboarding')} />
      </div>

      {/* ROW 5: Tijd tot volledig rendement (breed) */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <Field {...f('tijd_rendement')} {...fp('tijd_rendement')} />
      </div>

      {/* ROW 6: Actieplan (breed) */}
      <div style={{ ...s.sectionDivider, paddingBottom: '80px' }}>
        <Field {...f('actieplan')} {...fp('actieplan')} />
      </div>

      {saveStatus && <p style={s.saveStatus}>{saveStatus}</p>}
    </main>
  )
}
