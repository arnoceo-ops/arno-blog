'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

const SECTIONS = [
  // Pagina 5
  { id: 'kwartaal_jaar', label: 'KWARTAAL / JAAR', sub: 'Kwartaalthema periode', type: 'input', page: 5 },
  { id: 'themanaam', label: 'THEMANAAM', sub: 'Naam van het kwartaalthema', type: 'input', page: 5 },
  { id: 'meetbaar_doel', label: 'MEETBAAR DOEL', sub: 'Wat is het meetbare doel dit kwartaal?', type: 'textarea', page: 5 },
  { id: 'cruciale_kpi', label: 'CRUCIALE KPI', sub: 'Welke KPI is doorslaggevend?', type: 'input', page: 5 },
  { id: 'okr_wat_1', label: 'OKR — Doelstelling 1', sub: 'Wat willen we bereiken?', type: 'textarea', page: 5 },
  { id: 'okr_hoe_1', label: 'OKR — Kernresultaat 1', sub: 'Hoe meten we succes?', type: 'textarea', page: 5 },
  { id: 'okr_wie_1', label: 'OKR — Wie 1', sub: 'Wie is verantwoordelijk?', type: 'input', page: 5 },
  { id: 'okr_wat_2', label: 'OKR — Doelstelling 2', sub: 'Wat willen we bereiken?', type: 'textarea', page: 5 },
  { id: 'okr_hoe_2', label: 'OKR — Kernresultaat 2', sub: 'Hoe meten we succes?', type: 'textarea', page: 5 },
  { id: 'okr_wie_2', label: 'OKR — Wie 2', sub: 'Wie is verantwoordelijk?', type: 'input', page: 5 },
  { id: 'okr_wat_3', label: 'OKR — Doelstelling 3', sub: 'Wat willen we bereiken?', type: 'textarea', page: 5 },
  { id: 'okr_hoe_3', label: 'OKR — Kernresultaat 3', sub: 'Hoe meten we succes?', type: 'textarea', page: 5 },
  { id: 'okr_wie_3', label: 'OKR — Wie 3', sub: 'Wie is verantwoordelijk?', type: 'input', page: 5 },
  { id: 'klanten_krijgen_1', label: 'KLANTEN KRIJGEN — Actie 1', sub: 'Effectieve leadgeneratie', type: 'textarea', page: 5 },
  { id: 'klanten_krijgen_2', label: 'KLANTEN KRIJGEN — Actie 2', sub: 'Effectieve leadgeneratie', type: 'textarea', page: 5 },
  { id: 'klanten_krijgen_3', label: 'KLANTEN KRIJGEN — Actie 3', sub: 'Effectieve leadgeneratie', type: 'textarea', page: 5 },
  { id: 'klanten_uitbouwen_1', label: 'KLANTEN UITBOUWEN — Actie 1', sub: '100% klantaandeel', type: 'textarea', page: 5 },
  { id: 'klanten_uitbouwen_2', label: 'KLANTEN UITBOUWEN — Actie 2', sub: '100% klantaandeel', type: 'textarea', page: 5 },
  { id: 'klanten_uitbouwen_3', label: 'KLANTEN UITBOUWEN — Actie 3', sub: '100% klantaandeel', type: 'textarea', page: 5 },
  { id: 'klanten_houden_1', label: 'KLANTEN HOUDEN — Actie 1', sub: 'Levenslange retentie', type: 'textarea', page: 5 },
  { id: 'klanten_houden_2', label: 'KLANTEN HOUDEN — Actie 2', sub: 'Levenslange retentie', type: 'textarea', page: 5 },
  { id: 'klanten_houden_3', label: 'KLANTEN HOUDEN — Actie 3', sub: 'Levenslange retentie', type: 'textarea', page: 5 },
  { id: 'numbers_leads', label: 'LEADS #', sub: 'Aantal leads per periode', type: 'input', page: 5 },
  { id: 'numbers_bezoeken', label: 'BEZOEKEN #', sub: 'Aantal bezoeken per periode', type: 'input', page: 5 },
  { id: 'numbers_offertes', label: 'OFFERTES #', sub: 'Aantal offertes per periode', type: 'input', page: 5 },
  { id: 'numbers_orders', label: 'ORDERS #', sub: 'Aantal orders per periode', type: 'input', page: 5 },
  { id: 'numbers_referrals', label: 'REFERRALS #', sub: 'Aantal referrals per periode', type: 'input', page: 5 },
  { id: 'conversie_leads_bezoeken', label: 'CONVERSIE Leads : Bezoeken', sub: '% conversie', type: 'input', page: 5 },
  { id: 'conversie_bezoeken_offertes', label: 'CONVERSIE Bezoeken : Offertes', sub: '% conversie', type: 'input', page: 5 },
  { id: 'conversie_offertes_orders', label: 'CONVERSIE Offertes : Orders', sub: '% conversie', type: 'input', page: 5 },
  // Pagina 6
  { id: 'wensenlijst', label: 'WENSENLIJST', sub: 'Nieuwe Logo\'s (Olifanten)', type: 'textarea', page: 6 },
  { id: 'kpi_verkoopcyclus', label: 'VERKOOPCYCLUS', sub: 'Doorlooptijd', type: 'input', page: 6 },
  { id: 'kpi_conversieratio', label: 'CONVERSIERATIO', sub: '% conversie', type: 'input', page: 6 },
  { id: 'kpi_klantaandeel', label: '% KLANTAANDEEL', sub: 'Aandeel bij bestaande klanten', type: 'input', page: 6 },
  { id: 'kpi_klantretentie', label: '% KLANTRETENTIE', sub: 'Klantbehoud %', type: 'input', page: 6 },
  { id: 'kpi_forecast', label: '% BEHAALDE FORECAST', sub: 'Forecastnauwkeurigheid', type: 'input', page: 6 },
  { id: 'kpi_ordergrootte', label: '€ GEMIDDELDE ORDERGROOTTE', sub: 'Gemiddelde dealwaarde', type: 'input', page: 6 },
  { id: 'kpi_nieuwe_logos', label: '# NIEUWE LOGO\'S', sub: 'Nieuwe klanten', type: 'input', page: 6 },
  { id: 'kpi_omzet', label: '€ OMZET', sub: 'Omzetdoelstelling', type: 'input', page: 6 },
  { id: 'kpi_winst', label: '€/% WINST', sub: 'Winstdoelstelling', type: 'input', page: 6 },
  { id: 'kpi_referrals', label: '# REFERRALS', sub: 'Aantal referrals', type: 'input', page: 6 },
  { id: 'verkoopproces', label: 'VERKOOPPROCES / KLANTREIS', sub: 'Hoe ziet ons verkoopproces er uit? Wat hebben we geleerd? Wat willen we verbeteren?', type: 'textarea', page: 6 },
  { id: 'feestje', label: 'BOUW EEN FEESTJE', sub: 'Hoe vieren we onze successen?', type: 'textarea', page: 6 },
  { id: 'beloning', label: 'BELONING', sub: 'Hoe belonen we betrokken medewerkers?', type: 'textarea', page: 6 },
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
      <div style={styles.divider}>PAGINA 05 — KWARTAALPLAN & EXECUTIE</div>
      <div style={styles.grid}>{SECTIONS.filter(s => s.page === 5).map(renderSection)}</div>
      <div style={styles.divider}>PAGINA 06 — KPI DASHBOARD</div>
      <div style={styles.grid}>{SECTIONS.filter(s => s.page === 6).map(renderSection)}</div>
      {saveStatus && <p style={styles.saveStatus}>{saveStatus}</p>}
    </main>
  )
}