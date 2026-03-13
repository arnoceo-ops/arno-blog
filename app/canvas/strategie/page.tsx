'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import { PageHero } from '@/components/canvas/PageHero'

type FieldType = 'textarea' | 'input'

interface FieldDef {
  id: string
  label: string
  sub: string
  type: FieldType
}

const PREFIX = 'strategie'

const ALL_FIELDS: FieldDef[] = [
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
  { id: 'leiderschap_markten', label: 'LEIDERSCHAP', sub: 'Welke markt(en) willen we domineren?', type: 'input' },
  { id: 'leiderschap_wanneer', label: 'WANNEER?', sub: '', type: 'input' },
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

// Gedeelde stijlen
const BEBAS: React.CSSProperties = { fontFamily: 'var(--font-bebas), sans-serif', fontSize: '26px', letterSpacing: '3px', color: '#1a1714' }
const MONO_SUB: React.CSSProperties = { fontFamily: 'var(--font-space-mono, monospace)', fontSize: '18px', color: '#1a1714', opacity: 0.5, marginBottom: '14px' }
const LINE: React.CSSProperties = { flex: 1, height: '1px', backgroundColor: '#e0d8cc' }

const s = {
  page: { backgroundColor: '#f5f0e8', minHeight: '100vh', color: '#1a1714', fontFamily: 'var(--font-barlow, sans-serif)' } as React.CSSProperties,
  nav: { display: 'flex', alignItems: 'center', gap: '16px', padding: '24px 48px', fontSize: '12px', letterSpacing: '3px', borderBottom: '1px solid #e0d8cc' } as React.CSSProperties,
  sectionDivider: { borderTop: '1px solid #e0d8cc', padding: '48px 48px 0' } as React.CSSProperties,
  fieldLabel: { ...BEBAS, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' } as React.CSSProperties,
  fieldLabelLine: LINE,
  fieldSub: MONO_SUB,
  textarea: { width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #e0d8cc', color: '#1a1714', fontSize: '18px', padding: '12px 0', resize: 'none' as const, outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', lineHeight: 1.8, minHeight: '100px', boxSizing: 'border-box' as const },
  input: { width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #e0d8cc', color: '#1a1714', fontSize: '18px', padding: '10px 0', outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', boxSizing: 'border-box' as const },
  arnobotBtn: { marginTop: '8px', background: 'none', border: 'none', color: '#EE7700', fontSize: '11px', letterSpacing: '2px', cursor: 'pointer', padding: '0' } as React.CSSProperties,
  arnobotBox: { marginTop: '12px', borderLeft: '2px solid #EE7700', paddingLeft: '12px', fontSize: '13px', lineHeight: 1.8, color: '#1a1714', opacity: 0.8, fontFamily: 'var(--font-space-mono, monospace)', backgroundColor: '#fdf6ec', padding: '12px' } as React.CSSProperties,
  saveStatus: { position: 'fixed' as const, bottom: '24px', right: '24px', fontSize: '11px', letterSpacing: '3px', color: '#EE7700', opacity: 0.8 },
  groupLabel: { ...BEBAS, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' } as React.CSSProperties,
  groupSub: MONO_SUB,
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

// Fix 7: ArnoBot altijd zichtbaar bij ingevulde velden
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
        <button style={{ ...s.arnobotBtn, opacity: loading ? 0.4 : 0.7 }} onClick={() => !loading && onArnoBot(id, label, sub)}>
          {loading ? '→ ARNOBOT DENKT...' : feedback ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
        </button>
      )}
      {feedback && !loading && <div style={s.arnobotBox}>{feedback}</div>}
    </div>
  )
}

// Fix 7: ArnoBot voor inline input velden (cultuur, onderscheidend, leiderschap etc)
interface InlineInputProps {
  id: string
  value: string
  onChange: (id: string, value: string) => void
  onBlur: (id: string) => void
  feedback: string
  loading: boolean
  onArnoBot: (id: string, label: string, sub: string) => void
  label: string
}

function InlineInput({ id, value, onChange, onBlur, feedback, loading, onArnoBot, label }: InlineInputProps) {
  const hasAnswer = !!value.trim()
  return (
    <div style={{ marginBottom: '12px' }}>
      <input style={s.input} value={value} onChange={e => onChange(id, e.target.value)} onBlur={() => onBlur(id)} placeholder="..." />
      {hasAnswer && (
        <button style={{ ...s.arnobotBtn, opacity: loading ? 0.4 : 0.7 }} onClick={() => !loading && onArnoBot(id, label, '')}>
          {loading ? '→ ARNOBOT DENKT...' : feedback ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
        </button>
      )}
      {feedback && !loading && <div style={s.arnobotBox}>{feedback}</div>}
    </div>
  )
}

// Fix 3: SmallInput zonder borderBottom lijn, alleen placeholder punten
interface SmallInputProps {
  id: string
  label: string
  value: string
  onChange: (id: string, value: string) => void
  onBlur: (id: string) => void
  feedback: string
  loading: boolean
  onArnoBot: (id: string, label: string, sub: string) => void
}

function SmallInput({ id, label, value, onChange, onBlur, feedback, loading, onArnoBot }: SmallInputProps) {
  const hasAnswer = !!value.trim()
  return (
    <div style={{ marginBottom: '4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '16px', padding: '8px 0' }}>
        <span style={{ fontFamily: 'var(--font-space-mono, monospace)', fontSize: '13px', color: '#1a1714', opacity: 0.5 }}>{label}</span>
        <input
          style={{ backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #e0d8cc', color: '#1a1714', fontSize: '18px', padding: '4px 0', outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', width: '100%', boxSizing: 'border-box' as const }}
          value={value}
          onChange={e => onChange(id, e.target.value)}
          onBlur={() => onBlur(id)}
          placeholder="..."
        />
      </div>
      {hasAnswer && (
        <button style={{ ...s.arnobotBtn, opacity: loading ? 0.4 : 0.7, marginLeft: '156px' }} onClick={() => !loading && onArnoBot(id, label, '')}>
          {loading ? '→ ARNOBOT DENKT...' : feedback ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
        </button>
      )}
      {feedback && !loading && <div style={{ ...s.arnobotBox, marginLeft: '156px' }}>{feedback}</div>}
    </div>
  )
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
        <Link href="/canvas" style={{ color: '#1a1714', textDecoration: 'none', opacity: 0.4 }}>← CANVAS</Link>
        <span style={{ opacity: 0.2 }}>/</span>
        <span style={{ color: '#EE7700' }}>STRATEGIE</span>
      </nav>

      <PageHero number={1} />

      {/* ROW 1: Missie + Cultuur */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', paddingBottom: '48px' }}>
        <Field {...f('missie')} {...fp('missie')} />
        {/* Fix 1: CULTUUR in Bebas Neue, subtekst monospace eronder */}
        <div>
          <div style={{ ...BEBAS, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            CULTUUR <span style={LINE} />
          </div>
          <div style={{ ...MONO_SUB, marginBottom: '20px' }}>DNA, kernwaarden en gedrag</div>
          {['cultuur_1','cultuur_2','cultuur_3','cultuur_4','cultuur_5'].map((id, i) => (
            <div key={id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ color: '#EE7700', fontSize: '13px', opacity: 0.5, paddingTop: '10px' }}>{i + 1}</span>
              <InlineInput id={id} label={`Cultuur ${i + 1}`} {...fp(id)} />
            </div>
          ))}
        </div>
      </div>

      {/* ROW 2: Waardepropositie / Kerncompetenties / Dienstverlening */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', paddingBottom: '48px' }}>
        <Field {...f('waardepropositie')} {...fp('waardepropositie')} />
        <Field {...f('kerncompetenties')} {...fp('kerncompetenties')} />
        <Field {...f('dienstverlening')} {...fp('dienstverlening')} />
      </div>

      {/* ROW 3: Zandbak + Doelen + Acties */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', paddingBottom: '48px' }}>
        <Field {...f('zandbak')} {...fp('zandbak')} />
        {/* Fix 2: DOELEN in Bebas, Fix 3: geen strepen, alleen punten */}
        <div>
          <div style={{ ...BEBAS, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            DOELEN <span style={{ fontFamily: 'var(--font-space-mono, monospace)', fontSize: '13px', opacity: 0.5, fontWeight: 400 }}>3–5 JR</span>
            <span style={LINE} />
          </div>
          {(['doelen_datum','doelen_omzet','doelen_winst','doelen_klanten','doelen_marktaandeel','doelen_liquiditeit'] as const).map(id => (
            <SmallInput key={id} id={id} label={f(id).label} value={answers[id] || ''} onChange={handleChange} onBlur={handleBlur} feedback={arnobotFeedback[id] || ''} loading={arnobotLoading[id] || false} onArnoBot={handleArnoBot} />
          ))}
        </div>
        <div>
          <div style={{ ...BEBAS, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            ACTIES <span style={{ fontFamily: 'var(--font-space-mono, monospace)', fontSize: '13px', opacity: 0.5, fontWeight: 400 }}>1 JR</span>
            <span style={LINE} />
          </div>
          {(['acties_datum','acties_omzet','acties_winst','acties_brutomarge','acties_cash','acties_klanten'] as const).map(id => (
            <SmallInput key={id} id={id} label={f(id).label} value={answers[id] || ''} onChange={handleChange} onBlur={handleBlur} feedback={arnobotFeedback[id] || ''} loading={arnobotLoading[id] || false} onArnoBot={handleArnoBot} />
          ))}
        </div>
      </div>

      {/* ROW 4: Leiderschap — Fix 4: Field component zodat ArnoBot werkt */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', paddingBottom: '64px' }}>
        <Field {...f('leiderschap_markten')} {...fp('leiderschap_markten')} />
        <Field {...f('leiderschap_wanneer')} {...fp('leiderschap_wanneer')} />
      </div>

      {/* PAGINA 2 */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', paddingBottom: '48px', borderTop: '2px solid #EE7700' }}>
        <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
          <p style={{ color: '#EE7700', fontSize: '12px', letterSpacing: '4px', opacity: 0.6, margin: 0 }}>PAGINA 02 — GROEI & ONDERSCHEID</p>
        </div>
        <Field {...f('merkbelofte')} {...fp('merkbelofte')} />
        <Field {...f('strategie_1_zin')} {...fp('strategie_1_zin')} />
        {/* Fix 5: ONDERSCHEIDEND VERMOGEN in Bebas + ArnoBot per veld */}
        <div>
          <div style={{ ...BEBAS, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            ONDERSCHEIDEND VERMOGEN <span style={LINE} />
          </div>
          <div style={{ ...MONO_SUB, marginBottom: '16px' }}>Welke kernactiviteiten ondersteunen de strategie in 1 zin?</div>
          {(['onderscheidend_1','onderscheidend_2','onderscheidend_3','onderscheidend_4','onderscheidend_5'] as const).map((id, i) => (
            <div key={id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ color: '#EE7700', fontSize: '13px', opacity: 0.5, paddingTop: '10px' }}>{i + 1}</span>
              <InlineInput id={id} label={`Onderscheidend ${i + 1}`} {...fp(id)} />
            </div>
          ))}
        </div>
      </div>

      {/* ROW 6: X-Factor / Winst per eenheid / Moonshots */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', paddingBottom: '48px' }}>
        <Field {...f('xfactor')} {...fp('xfactor')} />
        <Field {...f('winst_per_eenheid')} {...fp('winst_per_eenheid')} />
        <Field {...f('moonshots')} {...fp('moonshots')} />
      </div>

      {/* ROW 7: Schaalbaarheid */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <Field {...f('schaalbaarheid')} {...fp('schaalbaarheid')} />
      </div>

      {/* ROW 8: Repeterende omzet / Klantretentie / Referrals */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', paddingBottom: '48px' }}>
        <Field {...f('repeterende_omzet')} {...fp('repeterende_omzet')} />
        <Field {...f('klantretentie')} {...fp('klantretentie')} />
        <Field {...f('referrals')} {...fp('referrals')} />
      </div>

      {/* ROW 9: OMTM — Fix 6: subtekst eronder, Fix 7: ArnoBot via Field */}
      <div style={{ ...s.sectionDivider, paddingBottom: '80px' }}>
        <Field {...f('omtm')} {...fp('omtm')} />
      </div>

      {saveStatus && <p style={s.saveStatus}>{saveStatus}</p>}
    </main>
  )
}
