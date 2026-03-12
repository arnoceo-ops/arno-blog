'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

const SECTIONS = [
  { id: 'leider_naam', label: 'LEIDER', sub: 'Naam van de leider / CEO', type: 'input' },
  { id: 'leider_rol', label: 'ROL VAN DE LEIDER', sub: 'Wat is de primaire rol van de leider?', type: 'textarea' },
  { id: 'topteam_1', label: 'TOPTEAM 1', sub: 'Naam + functie', type: 'input' },
  { id: 'topteam_2', label: 'TOPTEAM 2', sub: 'Naam + functie', type: 'input' },
  { id: 'topteam_3', label: 'TOPTEAM 3', sub: 'Naam + functie', type: 'input' },
  { id: 'topteam_4', label: 'TOPTEAM 4', sub: 'Naam + functie', type: 'input' },
  { id: 'topteam_5', label: 'TOPTEAM 5', sub: 'Naam + functie', type: 'input' },
  { id: 'salesteam_structuur', label: 'SALESTEAM STRUCTUUR', sub: 'Hoe is het salesteam georganiseerd?', type: 'textarea' },
  { id: 'rollen_verantwoordelijkheden', label: 'ROLLEN & VERANTWOORDELIJKHEDEN', sub: 'Wie doet wat in het salesproces?', type: 'textarea' },
  { id: 'aanname_criteria', label: 'AANNAME CRITERIA', sub: 'Wat zijn de criteria voor nieuwe salesmensen?', type: 'textarea' },
  { id: 'onboarding', label: 'ONBOARDING', sub: 'Hoe worden nieuwe salesmensen ingewerkt?', type: 'textarea' },
  { id: 'training_ontwikkeling', label: 'TRAINING & ONTWIKKELING', sub: 'Hoe ontwikkelen we ons salesteam continu?', type: 'textarea' },
  { id: 'compensatie_model', label: 'COMPENSATIE MODEL', sub: 'Hoe beloont en motiveert het bedrijf zijn verkopers?', type: 'textarea' },
  { id: 'targets_kpi', label: 'TARGETS & KPI\'S', sub: 'Welke targets worden gesteld per verkoper?', type: 'textarea' },
  { id: 'performance_management', label: 'PERFORMANCE MANAGEMENT', sub: 'Hoe worden resultaten gemeten en besproken?', type: 'textarea' },
  { id: 'cultuur_energie', label: 'CULTUUR & ENERGIE', sub: 'Hoe houden we het salesteam gemotiveerd en energiek?', type: 'textarea' },
  { id: 'retentie_talent', label: 'RETENTIE TALENT', sub: 'Hoe houden we onze beste mensen vast?', type: 'textarea' },
  { id: 'zwakste_schakel', label: 'ZWAKSTE SCHAKEL', sub: 'Wat is het grootste mensen-probleem nu?', type: 'textarea' },
  { id: 'ideale_teamgrootte', label: 'IDEALE TEAMGROOTTE', sub: 'Hoeveel salesmensen heb je nodig voor je doel?', type: 'input' },
  { id: 'externe_partners', label: 'EXTERNE PARTNERS', sub: 'Welke externe partners / agencies / freelancers zetten we in?', type: 'textarea' },
  { id: 'succession_plan', label: 'SUCCESSION PLAN', sub: 'Wie neemt over als de leider uitvalt?', type: 'input' },
]

const styles = {
  page: { backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#f0ede6', padding: '48px', fontFamily: 'sans-serif' } as React.CSSProperties,
  nav: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px', fontSize: '12px', letterSpacing: '2px' } as React.CSSProperties,
  tag: { color: '#EE7700', fontSize: '12px', letterSpacing: '3px', marginBottom: '8px' } as React.CSSProperties,
  title: { color: '#f0ede6', fontSize: '48px', letterSpacing: '4px', margin: '0 0 64px 0' } as React.CSSProperties,
  divider: { color: '#EE7700', fontSize: '11px', letterSpacing: '4px', borderTop: '1px solid #EE7700', paddingTop: '12px', marginBottom: '32px', marginTop: '48px' } as React.CSSProperties,
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' } as React.CSSProperties,
  card: { borderTop: '1px solid #222', paddingTop: '20px' } as React.CSSProperties,
  label: { color: '#EE7700', fontSize: '11px', letterSpacing: '3px', marginBottom: '4px' } as React.CSSProperties,
  sub: { color: '#f0ede6', opacity: 0.35, fontSize: '12px', marginBottom: '12px' } as React.CSSProperties,
  textarea: { width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #333', color: '#f0ede6', fontSize: '14px', padding: '8px 0', resize: 'none', outline: 'none', fontFamily: 'sans-serif', lineHeight: 1.6, minHeight: '80px', boxSizing: 'border-box' } as React.CSSProperties,
  input: { width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #333', color: '#f0ede6', fontSize: '14px', padding: '8px 0', outline: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box' } as React.CSSProperties,
  saveStatus: { position: 'fixed', bottom: '24px', right: '24px', fontSize: '11px', letterSpacing: '2px', color: '#EE7700', opacity: 0.7 } as React.CSSProperties,
  arnobotBtn: { marginTop: '10px', background: 'none', border: 'none', color: '#EE7700', fontSize: '10px', letterSpacing: '2px', cursor: 'pointer', padding: '0', opacity: 0.5, transition: 'opacity 0.2s' } as React.CSSProperties,
  arnobotBtnLoading: { marginTop: '10px', background: 'none', border: 'none', color: '#EE7700', fontSize: '10px', letterSpacing: '2px', cursor: 'default', padding: '0', opacity: 0.3 } as React.CSSProperties,
  arnobotBox: { marginTop: '12px', borderLeft: '2px solid #EE7700', paddingLeft: '12px', fontSize: '12px', lineHeight: 1.7, color: '#f0ede6', opacity: 0.75 } as React.CSSProperties,
}

const PAGE3_IDS = ['leider_naam','leider_rol','topteam_1','topteam_2','topteam_3','topteam_4','topteam_5','salesteam_structuur','rollen_verantwoordelijkheden','aanname_criteria','onboarding','training_ontwikkeling']
const PAGE4_IDS = ['compensatie_model','targets_kpi','performance_management','cultuur_energie','retentie_talent','zwakste_schakel','ideale_teamgrootte','externe_partners','succession_plan']

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
        .in('question_id', SECTIONS.map(s => `mensen_${s.id}`))
      if (data) {
        const map: Record<string, string> = {}
        data.forEach(row => { map[row.question_id.replace('mensen_', '')] = row.answer })
        setAnswers(map)
      }
    }
    load()
  }, [user])

  const save = useCallback(async (sectionId: string, value: string) => {
    if (!user) return
    setSaveStatus('Opslaan...')
    await supabase.from('canvas_answers').upsert({
      user_id: user.id,
      question_id: `mensen_${sectionId}`,
      answer: value,
    }, { onConflict: 'user_id,question_id' })
    setSaveStatus('Opgeslagen ✓')
    setTimeout(() => setSaveStatus(''), 2000)
  }, [user])

  const handleChange = (id: string, value: string) => setAnswers(prev => ({ ...prev, [id]: value }))
  const handleBlur = (id: string) => save(id, answers[id] || '')

  const handleArnoBot = async (section: typeof SECTIONS[0]) => {
    const answer = answers[section.id] || ''
    setArnobotLoading(prev => ({ ...prev, [section.id]: true }))
    setArnobotFeedback(prev => ({ ...prev, [section.id]: '' }))
    try {
      const feedback = await getArnoBotFeedback(section.label, section.sub, answer)
      setArnobotFeedback(prev => ({ ...prev, [section.id]: feedback }))
    } catch {
      setArnobotFeedback(prev => ({ ...prev, [section.id]: 'ArnoBot is tijdelijk niet beschikbaar.' }))
    } finally {
      setArnobotLoading(prev => ({ ...prev, [section.id]: false }))
    }
  }

  const renderSection = (section: typeof SECTIONS[0]) => {
    const isLoading = arnobotLoading[section.id]
    const feedback = arnobotFeedback[section.id]
    const hasAnswer = !!(answers[section.id] || '').trim()
    return (
      <div key={section.id} style={styles.card}>
        <p style={styles.label}>{section.label}</p>
        <p style={styles.sub}>{section.sub}</p>
        {section.type === 'textarea' ? (
          <textarea style={styles.textarea} value={answers[section.id] || ''} onChange={e => handleChange(section.id, e.target.value)} onBlur={() => handleBlur(section.id)} placeholder="..." />
        ) : (
          <input style={styles.input} value={answers[section.id] || ''} onChange={e => handleChange(section.id, e.target.value)} onBlur={() => handleBlur(section.id)} placeholder="..." />
        )}
        {hasAnswer && (
          <button style={isLoading ? styles.arnobotBtnLoading : styles.arnobotBtn} onClick={() => !isLoading && handleArnoBot(section)} onMouseEnter={e => { if (!isLoading) (e.target as HTMLElement).style.opacity = '1' }} onMouseLeave={e => { if (!isLoading) (e.target as HTMLElement).style.opacity = '0.5' }}>
            {isLoading ? '→ ARNOBOT DENKT...' : feedback ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
          </button>
        )}
        {feedback && !isLoading && <div style={styles.arnobotBox}>{feedback}</div>}
      </div>
    )
  }

  return (
    <main style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/canvas" style={{ color: '#f0ede6', textDecoration: 'none', opacity: 0.4, fontSize: '12px', letterSpacing: '2px' }}>← CANVAS</Link>
        <span style={{ opacity: 0.4 }}>/</span>
        <span style={{ color: '#EE7700', fontSize: '12px', letterSpacing: '2px' }}>MENSEN</span>
      </nav>
      <p style={styles.tag}>03 — 04</p>
      <h1 style={styles.title}>MENSEN</h1>
      <div style={styles.divider}>PAGINA 03 — TEAM & STRUCTUUR</div>
      <div style={styles.grid}>{SECTIONS.filter(s => PAGE3_IDS.includes(s.id)).map(renderSection)}</div>
      <div style={styles.divider}>PAGINA 04 — PERFORMANCE & RETENTIE</div>
      <div style={styles.grid}>{SECTIONS.filter(s => PAGE4_IDS.includes(s.id)).map(renderSection)}</div>
      {saveStatus && <p style={styles.saveStatus}>{saveStatus}</p>}
    </main>
  )
}