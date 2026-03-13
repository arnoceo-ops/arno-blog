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

const PREFIX = 'uitvoering'

const ALL_FIELDS: FieldDef[] = [
  { id: 'kwartaal_jaar', label: 'Kwartaal / Jaar', sub: '', type: 'input' },
  { id: 'themanaam', label: 'Themanaam', sub: '', type: 'input' },
  { id: 'meetbaar_doel', label: 'Meetbaar doel', sub: '', type: 'input' },
  { id: 'cruciale_kpi', label: 'Cruciale KPI', sub: '', type: 'input' },
  { id: 'okr_wat_1', label: 'DOELSTELLING', sub: 'WAT willen we bereiken?', type: 'textarea' },
  { id: 'okr_hoe_1', label: 'KERNRESULTAAT', sub: 'HOE meten we succes?', type: 'textarea' },
  { id: 'okr_wie_1', label: 'EIGENAAR', sub: 'WIE is verantwoordelijk?', type: 'input' },
  { id: 'okr_wat_2', label: 'DOELSTELLING', sub: 'WAT willen we bereiken?', type: 'textarea' },
  { id: 'okr_hoe_2', label: 'KERNRESULTAAT', sub: 'HOE meten we succes?', type: 'textarea' },
  { id: 'okr_wie_2', label: 'EIGENAAR', sub: 'WIE is verantwoordelijk?', type: 'input' },
  { id: 'okr_wat_3', label: 'DOELSTELLING', sub: 'WAT willen we bereiken?', type: 'textarea' },
  { id: 'okr_hoe_3', label: 'KERNRESULTAAT', sub: 'HOE meten we succes?', type: 'textarea' },
  { id: 'okr_wie_3', label: 'EIGENAAR', sub: 'WIE is verantwoordelijk?', type: 'input' },
  { id: 'klanten_krijgen_1', label: 'Actie', sub: '', type: 'textarea' },
  { id: 'klanten_krijgen_2', label: 'Actie', sub: '', type: 'textarea' },
  { id: 'klanten_krijgen_3', label: 'Actie', sub: '', type: 'textarea' },
  { id: 'klanten_uitbouwen_1', label: 'Actie', sub: '', type: 'textarea' },
  { id: 'klanten_uitbouwen_2', label: 'Actie', sub: '', type: 'textarea' },
  { id: 'klanten_uitbouwen_3', label: 'Actie', sub: '', type: 'textarea' },
  { id: 'klanten_houden_1', label: 'Actie', sub: '', type: 'textarea' },
  { id: 'klanten_houden_2', label: 'Actie', sub: '', type: 'textarea' },
  { id: 'klanten_houden_3', label: 'Actie', sub: '', type: 'textarea' },
  { id: 'numbers_leads', label: '# Leads', sub: '', type: 'input' },
  { id: 'numbers_bezoeken', label: '# Bezoeken', sub: '', type: 'input' },
  { id: 'numbers_offertes', label: '# Offertes', sub: '', type: 'input' },
  { id: 'numbers_orders', label: '# Orders', sub: '', type: 'input' },
  { id: 'numbers_referrals', label: '# Referrals', sub: '', type: 'input' },
  { id: 'conversie_leads_bezoeken', label: 'Leads → Bezoeken', sub: '', type: 'input' },
  { id: 'conversie_bezoeken_offertes', label: 'Bezoeken → Offertes', sub: '', type: 'input' },
  { id: 'conversie_offertes_orders', label: 'Offertes → Orders', sub: '', type: 'input' },
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
  const response = await fetch('/api/arnobot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, sub, answer }),
  })
  if (!response.ok) throw new Error('ArnoBot request failed')
  const data = await response.json()
  return data.feedback
}

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
  textarea: { width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #e0d8cc', color: '#1a1714', fontSize: '18px', padding: '12px 0', resize: 'none' as const, outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', lineHeight: 1.8, minHeight: '90px', boxSizing: 'border-box' as const },
  input: { width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #e0d8cc', color: '#1a1714', fontSize: '18px', padding: '10px 0', outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', boxSizing: 'border-box' as const },
  arnobotBtn: { marginTop: '8px', background: 'none', border: 'none', color: '#EE7700', fontSize: '11px', letterSpacing: '2px', cursor: 'pointer', padding: '0' } as React.CSSProperties,
  arnobotBox: { marginTop: '12px', borderLeft: '2px solid #EE7700', paddingLeft: '12px', fontSize: '13px', lineHeight: 1.8, color: '#1a1714', opacity: 0.8, fontFamily: 'var(--font-space-mono, monospace)', backgroundColor: '#fdf6ec', padding: '12px' } as React.CSSProperties,
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
        ? <textarea style={s.textarea} value={value} onChange={e => onChange(id, e.target.value)} onBlur={() => onBlur(id)} placeholder="..." rows={3} />
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

function NumberCol({ id, label, value, onChange, onBlur, feedback, loading, onArnoBot }: { id: string; label: string; value: string; onChange: (id: string, v: string) => void; onBlur: (id: string) => void; feedback: string; loading: boolean; onArnoBot: (id: string, label: string, sub: string) => void }) {
  const hasAnswer = !!value.trim()
  return (
    <div style={{ borderTop: '1px solid #e0d8cc', paddingTop: '16px' }}>
      <div style={{ ...BEBAS, fontSize: '18px', letterSpacing: '2px', color: '#1a1714', marginBottom: '12px' }}>{label}</div>
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

function KpiRow({ id, label, value, onChange, onBlur, feedback, loading, onArnoBot }: { id: string; label: string; value: string; onChange: (id: string, v: string) => void; onBlur: (id: string) => void; feedback: string; loading: boolean; onArnoBot: (id: string, label: string, sub: string) => void }) {
  const hasAnswer = !!value.trim()
  return (
    <div style={{ marginBottom: '4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '16px', borderBottom: '1px solid #e0d8cc', padding: '10px 0' }}>
        <span style={{ fontFamily: 'var(--font-space-mono, monospace)', fontSize: '14px', color: '#1a1714', opacity: 0.5 }}>{label}</span>
        <input style={{ backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #e0d8cc', color: '#1a1714', fontSize: '18px', padding: '4px 0', outline: 'none', fontFamily: 'var(--font-space-mono, monospace)', width: '100%', boxSizing: 'border-box' as const }} value={value} onChange={e => onChange(id, e.target.value)} onBlur={() => onBlur(id)} placeholder="..." />
      </div>
      {hasAnswer && (
        <button style={{ ...s.arnobotBtn, opacity: loading ? 0.4 : 0.7, marginLeft: '196px' }} onClick={() => !loading && onArnoBot(id, label, '')}>
          {loading ? '→ ARNOBOT DENKT...' : feedback ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
        </button>
      )}
      {feedback && !loading && <div style={{ ...s.arnobotBox, marginLeft: '196px' }}>{feedback}</div>}
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

  const numColProps = (id: string) => ({
    ...fp(id),
    id,
    label: ALL_FIELDS.find(x => x.id === id)!.label,
  })

  const kpiProps = (id: string) => ({
    ...fp(id),
    id,
    label: ALL_FIELDS.find(x => x.id === id)!.label,
  })

  const f = (id: string) => ALL_FIELDS.find(x => x.id === id)!

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
          {(['kwartaal_jaar','themanaam','meetbaar_doel','cruciale_kpi'] as const).map(id => (
            <div key={id}>
              <div style={{ fontFamily: 'var(--font-space-mono, monospace)', fontSize: '14px', color: '#1a1714', opacity: 0.4, letterSpacing: '2px', marginBottom: '8px' }}>{f(id).label}</div>
              <input style={s.input} value={answers[id] || ''} onChange={e => handleChange(id, e.target.value)} onBlur={() => handleBlur(id)} placeholder="..." />
            </div>
          ))}
        </div>
      </div>

      {/* OKR'S */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <div style={{ ...s.groupLabel, marginBottom: '32px' }}>OKR'S — DOELSTELLINGEN<span style={s.fieldLabelLine} /></div>
        {[1,2,3].map(n => (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', marginBottom: n < 3 ? '32px' : 0 }}>
            <Field {...f(`okr_wat_${n}`)} {...fp(`okr_wat_${n}`)} />
            <Field {...f(`okr_hoe_${n}`)} {...fp(`okr_hoe_${n}`)} />
            <Field {...f(`okr_wie_${n}`)} {...fp(`okr_wie_${n}`)} />
          </div>
        ))}
      </div>

      {/* KLANTEN KRIJGEN / UITBOUWEN / HOUDEN */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', paddingBottom: '48px' }}>
        {[
          { key: 'krijgen', label: 'KLANTEN KRIJGEN', sub: 'Effectieve leadgeneratie' },
          { key: 'uitbouwen', label: 'KLANTEN UITBOUWEN', sub: '100% klantaandeel' },
          { key: 'houden', label: 'KLANTEN HOUDEN', sub: 'Levenslange retentie' },
        ].map(({ key, label, sub }) => (
          <div key={key}>
            <div style={{ ...s.groupLabel, marginBottom: '4px' }}>{label}<span style={s.fieldLabelLine} /></div>
            <div style={{ ...MONO_SUB, marginBottom: '24px' }}>{sub}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[1,2,3].map(n => <Field key={n} {...f(`klanten_${key}_${n}`)} {...fp(`klanten_${key}_${n}`)} />)}
            </div>
          </div>
        ))}
      </div>

      {/* NUMBERS + CONVERSIES */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <div style={{ ...s.groupLabel, marginBottom: '32px' }}>NUMBERS & CONVERSIES<span style={s.fieldLabelLine} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '24px', marginBottom: '32px' }}>
          {(['numbers_leads','numbers_bezoeken','numbers_offertes','numbers_orders','numbers_referrals'] as const).map(id => (
            <NumberCol key={id} {...numColProps(id)} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {(['conversie_leads_bezoeken','conversie_bezoeken_offertes','conversie_offertes_orders'] as const).map(id => (
            <NumberCol key={id} {...numColProps(id)} />
          ))}
        </div>
      </div>

      {/* PAGINA 6 */}
      <div style={{ ...s.sectionDivider, borderTop: '2px solid #EE7700', paddingBottom: '0' }}>
        <p style={{ color: '#EE7700', fontSize: '12px', letterSpacing: '4px', opacity: 0.6, margin: '0 0 40px' }}>PAGINA 06 — KPI DASHBOARD</p>
      </div>

      {/* WENSENLIJST */}
      <div style={{ padding: '48px 48px 48px', borderTop: '1px solid #e0d8cc' }}>
        <Field {...f('wensenlijst')} {...fp('wensenlijst')} />
      </div>

      {/* KPI DASHBOARD */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <div style={{ ...s.groupLabel, marginBottom: '24px' }}>DOELEN EN KPI DASHBOARD<span style={s.fieldLabelLine} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 80px' }}>
          {(['kpi_verkoopcyclus','kpi_conversieratio','kpi_klantaandeel','kpi_klantretentie','kpi_forecast','kpi_ordergrootte','kpi_nieuwe_logos','kpi_omzet','kpi_winst','kpi_referrals'] as const).map(id => (
            <KpiRow key={id} {...kpiProps(id)} />
          ))}
        </div>
      </div>

      {/* VERKOOPPROCES */}
      <div style={{ ...s.sectionDivider, paddingBottom: '48px' }}>
        <Field {...f('verkoopproces')} {...fp('verkoopproces')} />
      </div>

      {/* FEESTJE + BELONING */}
      <div style={{ ...s.sectionDivider, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', paddingBottom: '80px' }}>
        <Field {...f('feestje')} {...fp('feestje')} />
        <Field {...f('beloning')} {...fp('beloning')} />
      </div>

      {saveStatus && <p style={s.saveStatus}>{saveStatus}</p>}
    </main>
  )
}
