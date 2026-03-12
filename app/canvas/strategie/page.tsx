'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

const SECTIONS = [
  // Pagina 1
  { id: 'missie', label: 'MISSIE', sub: 'Reden van bestaan', type: 'textarea', page: 1 },
  { id: 'cultuur_1', label: 'CULTUUR 1', sub: 'DNA, kernwaarden en gedrag', type: 'input', page: 1 },
  { id: 'cultuur_2', label: 'CULTUUR 2', sub: 'DNA, kernwaarden en gedrag', type: 'input', page: 1 },
  { id: 'cultuur_3', label: 'CULTUUR 3', sub: 'DNA, kernwaarden en gedrag', type: 'input', page: 1 },
  { id: 'cultuur_4', label: 'CULTUUR 4', sub: 'DNA, kernwaarden en gedrag', type: 'input', page: 1 },
  { id: 'cultuur_5', label: 'CULTUUR 5', sub: 'DNA, kernwaarden en gedrag', type: 'input', page: 1 },
  { id: 'waardepropositie', label: 'WAARDEPROPOSITIE', sub: 'Welk voordeel bieden we?', type: 'textarea', page: 1 },
  { id: 'kerncompetenties', label: 'KERNCOMPETENTIES', sub: 'Waarin verschillen we van anderen?', type: 'textarea', page: 1 },
  { id: 'dienstverlening', label: 'DIENSTVERLENING', sub: 'Wat kopen klanten van ons?', type: 'textarea', page: 1 },
  { id: 'zandbak', label: 'ZANDBAK', sub: 'Marktsegmenten / Niches / Kernklanten / Personas', type: 'textarea', page: 1 },
  { id: 'doelen_datum', label: 'DOELEN — Datum', sub: '3-5 jaar', type: 'input', page: 1 },
  { id: 'doelen_omzet', label: 'DOELEN — Omzet €', sub: '3-5 jaar', type: 'input', page: 1 },
  { id: 'doelen_winst', label: 'DOELEN — Winst €', sub: '3-5 jaar', type: 'input', page: 1 },
  { id: 'doelen_klanten', label: 'DOELEN — Klanten #', sub: '3-5 jaar', type: 'input', page: 1 },
  { id: 'doelen_marktaandeel', label: 'DOELEN — Marktaandeel %', sub: '3-5 jaar', type: 'input', page: 1 },
  { id: 'doelen_liquiditeit', label: 'DOELEN — Liquiditeit %', sub: '3-5 jaar', type: 'input', page: 1 },
  { id: 'acties_datum', label: 'ACTIES — Datum', sub: '1 jaar', type: 'input', page: 1 },
  { id: 'acties_omzet', label: 'ACTIES — Omzet €', sub: '1 jaar', type: 'input', page: 1 },
  { id: 'acties_winst', label: 'ACTIES — Winst €', sub: '1 jaar', type: 'input', page: 1 },
  { id: 'acties_brutomarge', label: 'ACTIES — Brutomarge %', sub: '1 jaar', type: 'input', page: 1 },
  { id: 'acties_cash', label: 'ACTIES — Cash €', sub: '1 jaar', type: 'input', page: 1 },
  { id: 'acties_klanten', label: 'ACTIES — Klanten #', sub: '1 jaar', type: 'input', page: 1 },
  { id: 'leiderschap_markten', label: 'LEIDERSCHAP — Markten', sub: 'Welke markt(en) willen we domineren?', type: 'input', page: 1 },
  { id: 'leiderschap_wanneer', label: 'LEIDERSCHAP — Wanneer', sub: 'Wanneer domineren we deze markt?', type: 'input', page: 1 },
  // Pagina 2
  { id: 'merkbelofte', label: 'MERKBELOFTE', sub: 'Wat zijn onze unieke merkbeloftes en garanties?', type: 'textarea', page: 2 },
  { id: 'strategie_1_zin', label: 'STRATEGIE IN 1 ZIN', sub: 'Hoe onderscheiden we ons in de executie van onze concurrenten?', type: 'textarea', page: 2 },
  { id: 'onderscheidend_1', label: 'ONDERSCHEIDEND VERMOGEN 1', sub: 'Welke kernactiviteiten ondersteunen de strategie?', type: 'input', page: 2 },
  { id: 'onderscheidend_2', label: 'ONDERSCHEIDEND VERMOGEN 2', sub: 'Welke kernactiviteiten ondersteunen de strategie?', type: 'input', page: 2 },
  { id: 'onderscheidend_3', label: 'ONDERSCHEIDEND VERMOGEN 3', sub: 'Welke kernactiviteiten ondersteunen de strategie?', type: 'input', page: 2 },
  { id: 'onderscheidend_4', label: 'ONDERSCHEIDEND VERMOGEN 4', sub: 'Welke kernactiviteiten ondersteunen de strategie?', type: 'input', page: 2 },
  { id: 'onderscheidend_5', label: 'ONDERSCHEIDEND VERMOGEN 5', sub: 'Welke kernactiviteiten ondersteunen de strategie?', type: 'input', page: 2 },
  { id: 'xfactor', label: 'X-FACTOR', sub: '10X meerwaarde', type: 'textarea', page: 2 },
  { id: 'winst_per_eenheid', label: 'WINST PER EENHEID', sub: 'Economische motor', type: 'textarea', page: 2 },
  { id: 'moonshots', label: 'MOONSHOTS', sub: '+1000%', type: 'textarea', page: 2 },
  { id: 'schaalbaarheid', label: 'SCHAALBAARHEID', sub: 'Hoe maken we onze dienstverlening schaalbaar?', type: 'textarea', page: 2 },
  { id: 'repeterende_omzet', label: 'REPETERENDE OMZET', sub: 'Hoe blijven we klanten aan ons binden?', type: 'textarea', page: 2 },
  { id: 'klantretentie', label: 'KLANTRETENTIE', sub: 'Hoe leveren we continue waarde aan onze klanten?', type: 'textarea', page: 2 },
  { id: 'referrals', label: 'REFERRALS', sub: 'Hoe maken we ambassadeurs van onze klanten?', type: 'textarea', page: 2 },
  { id: 'omtm', label: 'OMTM', sub: 'Wat is de belangrijkste prestatie-indicator?', type: 'input', page: 2 },
]

const styles = {
  page: { backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#f0ede6', padding: '48px', fontFamily: 'sans-serif' } as React.CSSProperties,
  nav: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px', fontSize: '12px', letterSpacing: '2px' } as React.CSSProperties,
  tag: { color: '#EE7700', fontSize: '12px', letterSpacing: '3px', marginBottom: '8px' } as React.CSSProperties,
  title: { fontFamily: 'var(--font-bebas), sans-serif', color: '#f0ede6', fontSize: '72px', letterSpacing: '6px', margin: '0 0 64px 0', lineHeight: 1 } as React.CSSProperties,
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
        .in('question_id', SECTIONS.map(s => `strategie_${s.id}`))
      if (data) {
        const map: Record<string, string> = {}
        data.forEach(row => { map[row.question_id.replace('strategie_', '')] = row.answer })
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
      question_id: `strategie_${sectionId}`,
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
        <span style={{ color: '#EE7700', fontSize: '12px', letterSpacing: '2px' }}>STRATEGIE</span>
      </nav>
      <p style={styles.tag}>01 — 02</p>
      <h1 style={styles.title}>STRATEGIE</h1>
      <div style={styles.divider}>PAGINA 01 — FUNDAMENT</div>
      <div style={styles.grid}>{SECTIONS.filter(s => s.page === 1).map(renderSection)}</div>
      <div style={styles.divider}>PAGINA 02 — GROEI & ONDERSCHEID</div>
      <div style={styles.grid}>{SECTIONS.filter(s => s.page === 2).map(renderSection)}</div>
      {saveStatus && <p style={styles.saveStatus}>{saveStatus}</p>}
    </main>
  )
}