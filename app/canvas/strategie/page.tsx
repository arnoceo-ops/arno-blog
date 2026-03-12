'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

type FieldType = 'textarea' | 'input'

interface Field {
  id: string
  label: string
  sub: string
  type: FieldType
}

const PREFIX = 'strategie'

const ALL_FIELDS: Field[] = [
  { id: 'missie', label: 'MISSIE', sub: 'Reden van bestaan', type: 'textarea' },
  { id: 'cultuur_1', label: 'CULTUUR 1', sub: '', type: 'input' },
  { id: 'cultuur_2', label: 'CULTUUR 2', sub: '', type: 'input' },
  { id: 'cultuur_3', label: 'CULTUUR 3', sub: '', type: 'input' },
  { id: 'cultuur_4', label: 'CULTUUR 4', sub: '', type: 'input' },
  { id: 'cultuur_5', label: 'CULTUUR 5', sub: '', type: 'input' },
  { id: 'waardepropositie', label: 'WAARDEPROPOSITIE', sub: 'Welk voordeel bieden we?', type: 'textarea' },
  { id: 'kerncompetenties', label: 'KERNCOMPETENTIES', sub: 'Waarin verschillen we van anderen?', type: 'textarea' },
  { id: 'dienstverlening', label: 'DIENSTVERLENING', sub: 'Wat kopen klanten van ons?', type: 'textarea' },
  { id: 'zandbak', label: 'ZANDBAK', sub: 'Marktsegmenten / Niches / Kernklanten / Personas', type: 'textarea' },
  { id: 'doelen_datum', label: 'Datum', sub: '', type: 'input' },
  { id: 'doelen_omzet', label: 'Omzet €', sub: '', type: 'input' },
  { id: 'doelen_winst', label: 'Winst €', sub: '', type: 'input' },
  { id: 'doelen_klanten', label: 'Klanten #', sub: '', type: 'input' },
  { id: 'doelen_marktaandeel', label: 'Marktaandeel %', sub: '', type: 'input' },
  { id: 'doelen_liquiditeit', label: 'Liquiditeit %', sub: '', type: 'input' },
  { id: 'acties_datum', label: 'Datum', sub: '', type: 'input' },
  { id: 'acties_omzet', label: 'Omzet €', sub: '', type: 'input' },
  { id: 'acties_winst', label: 'Winst €', sub: '', type: 'input' },
  { id: 'acties_brutomarge', label: 'Brutomarge %', sub: '', type: 'input' },
  { id: 'acties_cash', label: 'Cash €', sub: '', type: 'input' },
  { id: 'acties_klanten', label: 'Klanten #', sub: '', type: 'input' },
  { id: 'leiderschap_markten', label: 'Markten', sub: '', type: 'input' },
  { id: 'leiderschap_wanneer', label: 'Wanneer', sub: '', type: 'input' },
  { id: 'merkbelofte', label: 'MERKBELOFTE', sub: 'Wat zijn onze unieke merkbeloftes en garanties?', type: 'textarea' },
  { id: 'strategie_1_zin', label: 'STRATEGIE IN 1 ZIN', sub: 'Hoe onderscheiden we ons in de executie van onze concurrenten?', type: 'textarea' },
  { id: 'onderscheidend_1', label: '1', sub: '', type: 'input' },
  { id: 'onderscheidend_2', label: '2', sub: '', type: 'input' },
  { id: 'onderscheidend_3', label: '3', sub: '', type: 'input' },
  { id: 'onderscheidend_4', label: '4', sub: '', type: 'input' },
  { id: 'onderscheidend_5', label: '5', sub: '', type: 'input' },
  { id: 'xfactor', label: 'X-FACTOR', sub: '10X meerwaarde', type: 'textarea' },
  { id: 'winst_per_eenheid', label: 'WINST PER EENHEID', sub: 'Economische motor', type: 'textarea' },
  { id: 'moonshots', label: 'MOONSHOTS', sub: '+1000%', type: 'textarea' },
  { id: 'schaalbaarheid', label: 'SCHAALBAARHEID', sub: 'Hoe maken we onze dienstverlening schaalbaar?', type: 'textarea' },
  { id: 'repeterende_omzet', label: 'REPETERENDE OMZET', sub: 'Hoe blijven we klanten aan ons binden?', type: 'textarea' },
  { id: 'klantretentie', label: 'KLANTRETENTIE', sub: 'Hoe leveren we continue waarde aan onze klanten?', type: 'textarea' },
  { id: 'referrals', label: 'REFERRALS', sub: 'Hoe maken we ambassadeurs van onze klanten?', type: 'textarea' },
  { id: 'omtm', label: 'OMTM', sub: 'Wat is de belangrijkste prestatie-indicator?', type: 'input' },
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
  section: { padding: '0 48px', marginBottom: '0' } as React.CSSProperties,
  sectionDivider: { borderTop: '1px solid #1e1e1e', padding: '48px 48px 0' } as React.CSSProperties,
  fieldLabel: { fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: '#f0ede6', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' } as React.CSSProperties,
  fieldLabelLine: { flex: 1, height: '1px', backgroundColor: '#222' } as React.CSSProperties,
  fieldSub: { fontSize: '12px', color: '#f0ede6', opacity: 0.35, marginBottom: '12px' } as React.CSSProperties,
  textarea: { width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #1e1e1e', color: '#f0ede6', fontSize: '14px', padding: '12px 0', resize: 'none', outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', lineHeight: 1.7, minHeight: '100px', boxSizing: 'border-box' } as React.CSSProperties,
  input: { width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #1e1e1e', color: '#f0ede6', fontSize: '14px', padding: '10px 0', outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', boxSizing: 'border-box' } as React.CSSProperties,
  arnobotBtn: { marginTop: '8px', background: 'none', border: 'none', color: '#EE7700', fontSize: '10px', letterSpacing: '2px', cursor: 'pointer', padding: '0', opacity: 0.4 } as React.CSSProperties,
  arnobotBox: { marginTop: '12px', borderLeft: '2px solid #EE7700', paddingLeft: '12px', fontSize: '12px', lineHeight: 1.7, color: '#f0ede6', opacity: 0.7, fontFamily: 'var(--font-space-mono, monospace)' } as React.CSSProperties,
  saveStatus: { position: 'fixed', bottom: '24px', right: '24px', fontSize: '10px', letterSpacing: '3px', color: '#EE7700', opacity: 0.6 } as React.CSSProperties,
  groupSectionLabel: { fontSize: '11px', fontWeight: 700, letterSpacing: '4px', color: '#EE7700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' } as React.CSSProperties,
  groupSectionSub: { fontSize: '11px', color: '#f0ede6', opacity: 0.35, letterSpacing: '1px', fontWeight: 400 } as React.CSSProperties,
}

export default function StrategiePage() {
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

  const handleChange = (id: string, value: string) => setAnswers(prev => ({ ...prev, [id]: value }))
  const handleBlur = (id: string) => save(id, answers[id] || '')

  const handleArnoBot = async (id: string, label: string, sub: string) => {
    const answer = answers[id] || ''
    setArnobotLoading(prev => ({ ...prev, [id]: true }))
    setArnobotFeedback(prev => ({ ...prev, [id]: '' }))
    try {
      const feedback = await getArnoBotFeedback(label, sub, answer)
      setArnobotFeedback(prev => ({ ...prev, [id]: feedback }))
    } catch {
      setArnobotFeedback(prev => ({ ...prev, [id]: 'ArnoBot is tijdelijk niet beschikbaar.' }))
    } finally {
      setArnobotLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const Field = ({ id, label, sub, type, showArnoBot = true }: Field & { showArnoBot?: boolean }) => {
    const isLoading = arnobotLoading[id]
    const feedback = arnobotFeedback[id]
    const hasAnswer = !!(answers[id] || '').trim()
    return (
      <div>
        <div style={s.fieldLabel}>
          {label}
          <span style={s.fieldLabelLine} />
        </div>
        {sub && <div style={s.fieldSub}>{sub}</div>}
        {type === 'textarea'
          ? <textarea style={s.textarea} value={answers[id] || ''} onChange={e => handleChange(id, e.target.value)} onBlur={() => handleBlur(id)} placeholder="..." rows={4} />
          : <input style={s.input} value={answers[id] || ''} onChange={e => handleChange(id, e.target.value)} onBlur={() => handleBlur(id)} placeholder="..." />
        }
        {showArnoBot && hasAnswer && (
          <button style={{ ...s.arnobotBtn, opacity: isLoading ? 0.2 : 0.4 }} onClick={() => !isLoading && handleArnoBot(id, label, sub)}>
            {isLoading ? '→ ARNOBOT DENKT...' : feedback ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
          </button>
        )}
        {feedback && !isLoading && <div style={s.arnobotBox}>{feedback}</div>}
      </div>
    )
  }

  const SmallInput = ({ id, label }: { id: string; label: string }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '16px', borderBottom: '1px solid #1a1a1a', padding: '10px 0' }}>
      <span style={{ fontSize: '12px', color: '#f0ede6', opacity: 0.5, letterSpacing: '1px' }}>{label}</span>
      <input style={{ backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #1e1e1e', color: '#f0ede6', fontSize: '13px', padding: '4px 0', outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', width: '100%', boxSizing: 'border-box' as const }} value={answers[id] || ''} onChange={e => handleChange(id, e.target.value)} onBlur={() => handleBlur(id)} placeholder="—" />
    </div>
  )

  return (
    <main style={s.page}>
      <nav style={s.nav}>
        <Link href="/canvas" style={{ color: '#f0ede6', textDecoration: 'none', opacity: 0.4 }}>← CANVAS</Link>
        <span style={{ opacity: 0.2 }}>/</span>
        <span style={{ color: '#EE7700' }}>STRATEGIE</span>
      </nav>

      <div style={s.pageHeader}>
        <p style={s.pageTag}>01 — 02</p>
        <h1 style={s.pageTitle}>STRATEGIE</h1>
      </div>

      {/* PAGINA 1 */}

      {/* ROW 1: Missie + Cultuur */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', paddingBottom: '48px' }}>
        <Field {...ALL_FIELDS[0]} />
        <div>
          <div style={s.groupSectionLabel}>
            CULTUUR <span style={s.groupSectionSub}>DNA, kernwaarden en gedrag</span>
            <span style={s.fieldLabelLine} />
          </div>
          {['cultuur_1','cultuur_2','cultuur_3','cultuur_4','cultuur_5'].map((id, i) => (
            <div key={id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#EE7700', fontSize: '12px', opacity: 0.5 }}>{i + 1}</span>
              <input style={s.input} value={answers[id] || ''} onChange={e => handleChange(id, e.target.value)} onBlur={() => handleBlur(id)} placeholder="..." />
            </div>
          ))}
        </div>
      </div>

      {/* ROW 2: Waardepropositie / Kerncompetenties / Dienstverlening */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', paddingBottom: '48px' }}>
        <Field {...ALL_FIELDS[6]} />
        <Field {...ALL_FIELDS[7]} />
        <Field {...ALL_FIELDS[8]} />
      </div>

      {/* ROW 3: Zandbak + Doelen + Acties */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', paddingBottom: '48px' }}>
        <Field {...ALL_FIELDS[9]} />
        <div>
          <div style={s.groupSectionLabel}>DOELEN <span style={s.groupSectionSub}>3-5 JR</span><span style={s.fieldLabelLine} /></div>
          {[
            { id: 'doelen_datum', label: 'Datum' },
            { id: 'doelen_omzet', label: 'Omzet €' },
            { id: 'doelen_winst', label: 'Winst €' },
            { id: 'doelen_klanten', label: 'Klanten #' },
            { id: 'doelen_marktaandeel', label: 'Marktaandeel %' },
            { id: 'doelen_liquiditeit', label: 'Liquiditeit %' },
          ].map(f => <SmallInput key={f.id} {...f} />)}
        </div>
        <div>
          <div style={s.groupSectionLabel}>ACTIES <span style={s.groupSectionSub}>1 JR</span><span style={s.fieldLabelLine} /></div>
          {[
            { id: 'acties_datum', label: 'Datum' },
            { id: 'acties_omzet', label: 'Omzet €' },
            { id: 'acties_winst', label: 'Winst €' },
            { id: 'acties_brutomarge', label: 'Brutomarge %' },
            { id: 'acties_cash', label: 'Cash €' },
            { id: 'acties_klanten', label: 'Klanten #' },
          ].map(f => <SmallInput key={f.id} {...f} />)}
        </div>
      </div>

      {/* ROW 4: Leiderschap */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', paddingBottom: '64px' }}>
        <div>
          <div style={s.groupSectionLabel}>LEIDERSCHAP <span style={s.groupSectionSub}>Welke markt(en) willen we domineren?</span><span style={s.fieldLabelLine} /></div>
          <input style={s.input} value={answers['leiderschap_markten'] || ''} onChange={e => handleChange('leiderschap_markten', e.target.value)} onBlur={() => handleBlur('leiderschap_markten')} placeholder="..." />
        </div>
        <div>
          <div style={s.groupSectionLabel}>WANNEER?<span style={s.fieldLabelLine} /></div>
          <input style={s.input} value={answers['leiderschap_wanneer'] || ''} onChange={e => handleChange('leiderschap_wanneer', e.target.value)} onBlur={() => handleBlur('leiderschap_wanneer')} placeholder="..." />
        </div>
      </div>

      {/* PAGINA 2 */}

      {/* ROW 5: Merkbelofte / Strategie in 1 zin / Onderscheidend Vermogen */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', paddingBottom: '48px', borderTop: '2px solid #EE7700' }}>
        <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
          <p style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '4px', opacity: 0.6, margin: 0 }}>PAGINA 02 — GROEI & ONDERSCHEID</p>
        </div>
        <Field {...ALL_FIELDS[24]} />
        <Field {...ALL_FIELDS[25]} />
        <div>
          <div style={s.groupSectionLabel}>ONDERSCHEIDEND VERMOGEN <span style={s.fieldLabelLine} /></div>
          <div style={{ ...s.groupSectionSub, marginBottom: '16px' }}>Welke kernactiviteiten ondersteunen de strategie in 1 zin?</div>
          {['onderscheidend_1','onderscheidend_2','onderscheidend_3','onderscheidend_4','onderscheidend_5'].map((id, i) => (
            <div key={id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#EE7700', fontSize: '12px', opacity: 0.5 }}>{i + 1}</span>
              <input style={s.input} value={answers[id] || ''} onChange={e => handleChange(id, e.target.value)} onBlur={() => handleBlur(id)} placeholder="..." />
            </div>
          ))}
        </div>
      </div>

      {/* ROW 6: X-Factor / Winst per eenheid / Moonshots */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', paddingBottom: '48px' }}>
        <Field {...ALL_FIELDS[31]} />
        <Field {...ALL_FIELDS[32]} />
        <Field {...ALL_FIELDS[33]} />
      </div>

      {/* ROW 7: Schaalbaarheid (breed) */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <Field {...ALL_FIELDS[34]} />
      </div>

      {/* ROW 8: Repeterende omzet / Klantretentie / Referrals */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', paddingBottom: '48px' }}>
        <Field {...ALL_FIELDS[35]} />
        <Field {...ALL_FIELDS[36]} />
        <Field {...ALL_FIELDS[37]} />
      </div>

      {/* ROW 9: OMTM (breed) */}
      <div style={{ ...s.sectionDivider, paddingBottom: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '18px', letterSpacing: '4px', color: '#f0ede6', whiteSpace: 'nowrap' }}>OMTM</span>
          <span style={{ fontSize: '12px', color: '#f0ede6', opacity: 0.35, whiteSpace: 'nowrap' }}>Wat is de belangrijkste prestatie-indicator?</span>
          <input style={{ ...s.input, borderBottom: '1px solid #EE7700' }} value={answers['omtm'] || ''} onChange={e => handleChange('omtm', e.target.value)} onBlur={() => handleBlur('omtm')} placeholder="..." />
        </div>
      </div>

      {saveStatus && <p style={s.saveStatus}>{saveStatus}</p>}
    </main>
  )
}