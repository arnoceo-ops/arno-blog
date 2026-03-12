'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

const SECTIONS = [
  { id: 'salesproces', label: 'SALESPROCES', sub: 'Beschrijf het stap-voor-stap salesproces', type: 'textarea' },
  { id: 'pipeline_fases', label: 'PIPELINE FASES', sub: 'Welke fases heeft jullie pipeline?', type: 'textarea' },
  { id: 'leadgeneratie', label: 'LEADGENERATIE', sub: 'Hoe genereren we nieuwe leads?', type: 'textarea' },
  { id: 'kwalificatie', label: 'KWALIFICATIE', sub: 'Hoe kwalificeren we leads? (criteria)', type: 'textarea' },
  { id: 'gemiddelde_dealgrootte', label: 'GEMIDDELDE DEALGROOTTE', sub: 'Wat is de gemiddelde orderwaarde in €?', type: 'input' },
  { id: 'gemiddelde_salescyclus', label: 'GEMIDDELDE SALESCYCLUS', sub: 'Hoe lang duurt een gemiddelde deal? (dagen)', type: 'input' },
  { id: 'conversieratio', label: 'CONVERSIERATIO', sub: 'Hoeveel % van leads wordt klant?', type: 'input' },
  { id: 'prioriteit_accounts', label: 'PRIORITEIT ACCOUNTS', sub: 'Welke accounts of sectoren krijgen prioriteit?', type: 'textarea' },
  { id: 'tools_crm', label: 'TOOLS & CRM', sub: 'Welke tools en CRM gebruiken we?', type: 'textarea' },
  { id: 'grootste_bottleneck', label: 'GROOTSTE BOTTLENECK', sub: 'Wat blokkeert groei in de pipeline nu?', type: 'textarea' },
  { id: 'kpi_omzet', label: 'KPI — Omzet', sub: 'Maandelijkse omzetdoelstelling €', type: 'input' },
  { id: 'kpi_nieuwe_klanten', label: 'KPI — Nieuwe Klanten', sub: 'Aantal nieuwe klanten per maand #', type: 'input' },
  { id: 'kpi_churn', label: 'KPI — Churn', sub: 'Klantverloop % per kwartaal', type: 'input' },
  { id: 'kpi_nps', label: 'KPI — NPS', sub: 'Net Promoter Score doelstelling', type: 'input' },
  { id: 'kpi_winst', label: 'KPI — Winst', sub: 'Netto winstmarge % doelstelling', type: 'input' },
  { id: 'groei_hefboom', label: 'GROEI HEFBOOM', sub: 'Wat is de grootste groeikans de komende 12 maanden?', type: 'textarea' },
  { id: 'quick_wins', label: 'QUICK WINS', sub: 'Wat kunnen we de komende 90 dagen doen voor direct resultaat?', type: 'textarea' },
  { id: 'strategische_projecten', label: 'STRATEGISCHE PROJECTEN', sub: 'Welke 3-5 projecten hebben hoogste prioriteit dit jaar?', type: 'textarea' },
  { id: 'risicos', label: "RISICO'S", sub: "Wat zijn de grootste risico's voor de business?", type: 'textarea' },
  { id: 'actieplan_90_dagen', label: 'ACTIEPLAN 90 DAGEN', sub: 'Concrete acties voor de komende 90 dagen', type: 'textarea' },
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

const PAGE5_IDS = ['salesproces','pipeline_fases','leadgeneratie','kwalificatie','gemiddelde_dealgrootte','gemiddelde_salescyclus','conversieratio','prioriteit_accounts','tools_crm','grootste_bottleneck']
const PAGE6_IDS = ['kpi_omzet','kpi_nieuwe_klanten','kpi_churn','kpi_nps','kpi_winst','groei_hefboom','quick_wins','strategische_projecten','risicos','actieplan_90_dagen']

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
        .in('question_id', SECTIONS.map(s => `uitvoering_${s.id}`))
      if (data) {
        const map: Record<string, string> = {}
        data.forEach(row => { map[row.question_id.replace('uitvoering_', '')] = row.answer })
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
      question_id: `uitvoering_${sectionId}`,
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
        <span style={{ color: '#EE7700', fontSize: '12px', letterSpacing: '2px' }}>UITVOERING</span>
      </nav>
      <p style={styles.tag}>05 — 06</p>
      <h1 style={styles.title}>UITVOERING</h1>
      <div style={styles.divider}>PAGINA 05 — EXECUTIE & PIPELINE</div>
      <div style={styles.grid}>{SECTIONS.filter(s => PAGE5_IDS.includes(s.id)).map(renderSection)}</div>
      <div style={styles.divider}>PAGINA 06 — KPI DASHBOARD & GROEI</div>
      <div style={styles.grid}>{SECTIONS.filter(s => PAGE6_IDS.includes(s.id)).map(renderSection)}</div>
      {saveStatus && <p style={styles.saveStatus}>{saveStatus}</p>}
    </main>
  )
}