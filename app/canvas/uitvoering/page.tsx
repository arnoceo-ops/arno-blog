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
  page: number
  group?: string
}

const SECTIONS: Field[] = [
  // Pagina 5
  { id: 'kwartaal_jaar', label: 'Kwartaal / Jaar', sub: 'Kwartaalthema periode', type: 'input', page: 5, group: 'KWARTAALTHEMA' },
  { id: 'themanaam', label: 'Themanaam', sub: 'Naam van het kwartaalthema', type: 'input', page: 5, group: 'KWARTAALTHEMA' },
  { id: 'meetbaar_doel', label: 'Meetbaar doel', sub: 'Wat is het meetbare doel dit kwartaal?', type: 'textarea', page: 5, group: 'KWARTAALTHEMA' },
  { id: 'cruciale_kpi', label: 'Cruciale KPI', sub: 'Welke KPI is doorslaggevend?', type: 'input', page: 5, group: 'KWARTAALTHEMA' },
  { id: 'okr_wat_1', label: 'Doelstelling 1', sub: 'Wat willen we bereiken?', type: 'textarea', page: 5, group: "OKR'S" },
  { id: 'okr_hoe_1', label: 'Kernresultaat 1', sub: 'Hoe meten we succes?', type: 'textarea', page: 5, group: "OKR'S" },
  { id: 'okr_wie_1', label: 'Wie 1', sub: 'Wie is verantwoordelijk?', type: 'input', page: 5, group: "OKR'S" },
  { id: 'okr_wat_2', label: 'Doelstelling 2', sub: 'Wat willen we bereiken?', type: 'textarea', page: 5, group: "OKR'S" },
  { id: 'okr_hoe_2', label: 'Kernresultaat 2', sub: 'Hoe meten we succes?', type: 'textarea', page: 5, group: "OKR'S" },
  { id: 'okr_wie_2', label: 'Wie 2', sub: 'Wie is verantwoordelijk?', type: 'input', page: 5, group: "OKR'S" },
  { id: 'okr_wat_3', label: 'Doelstelling 3', sub: 'Wat willen we bereiken?', type: 'textarea', page: 5, group: "OKR'S" },
  { id: 'okr_hoe_3', label: 'Kernresultaat 3', sub: 'Hoe meten we succes?', type: 'textarea', page: 5, group: "OKR'S" },
  { id: 'okr_wie_3', label: 'Wie 3', sub: 'Wie is verantwoordelijk?', type: 'input', page: 5, group: "OKR'S" },
  { id: 'klanten_krijgen_1', label: 'Actie 1', sub: 'Effectieve leadgeneratie', type: 'textarea', page: 5, group: 'KLANTEN KRIJGEN' },
  { id: 'klanten_krijgen_2', label: 'Actie 2', sub: 'Effectieve leadgeneratie', type: 'textarea', page: 5, group: 'KLANTEN KRIJGEN' },
  { id: 'klanten_krijgen_3', label: 'Actie 3', sub: 'Effectieve leadgeneratie', type: 'textarea', page: 5, group: 'KLANTEN KRIJGEN' },
  { id: 'klanten_uitbouwen_1', label: 'Actie 1', sub: '100% klantaandeel', type: 'textarea', page: 5, group: 'KLANTEN UITBOUWEN' },
  { id: 'klanten_uitbouwen_2', label: 'Actie 2', sub: '100% klantaandeel', type: 'textarea', page: 5, group: 'KLANTEN UITBOUWEN' },
  { id: 'klanten_uitbouwen_3', label: 'Actie 3', sub: '100% klantaandeel', type: 'textarea', page: 5, group: 'KLANTEN UITBOUWEN' },
  { id: 'klanten_houden_1', label: 'Actie 1', sub: 'Levenslange retentie', type: 'textarea', page: 5, group: 'KLANTEN HOUDEN' },
  { id: 'klanten_houden_2', label: 'Actie 2', sub: 'Levenslange retentie', type: 'textarea', page: 5, group: 'KLANTEN HOUDEN' },
  { id: 'klanten_houden_3', label: 'Actie 3', sub: 'Levenslange retentie', type: 'textarea', page: 5, group: 'KLANTEN HOUDEN' },
  { id: 'numbers_leads', label: '# Leads', sub: 'Aantal leads per periode', type: 'input', page: 5, group: 'NUMBERS' },
  { id: 'numbers_bezoeken', label: '# Bezoeken', sub: 'Aantal bezoeken per periode', type: 'input', page: 5, group: 'NUMBERS' },
  { id: 'numbers_offertes', label: '# Offertes', sub: 'Aantal offertes per periode', type: 'input', page: 5, group: 'NUMBERS' },
  { id: 'numbers_orders', label: '# Orders', sub: 'Aantal orders per periode', type: 'input', page: 5, group: 'NUMBERS' },
  { id: 'numbers_referrals', label: '# Referrals', sub: 'Aantal referrals per periode', type: 'input', page: 5, group: 'NUMBERS' },
  { id: 'conversie_leads_bezoeken', label: 'Leads : Bezoeken', sub: '% conversie', type: 'input', page: 5, group: 'CONVERSIES' },
  { id: 'conversie_bezoeken_offertes', label: 'Bezoeken : Offertes', sub: '% conversie', type: 'input', page: 5, group: 'CONVERSIES' },
  { id: 'conversie_offertes_orders', label: 'Offertes : Orders', sub: '% conversie', type: 'input', page: 5, group: 'CONVERSIES' },
  // Pagina 6
  { id: 'wensenlijst', label: 'WENSENLIJST', sub: "Nieuwe Logo's (Olifanten)", type: 'textarea', page: 6 },
  { id: 'kpi_verkoopcyclus', label: 'Verkoopcyclus', sub: 'Doorlooptijd', type: 'input', page: 6, group: 'KPI DASHBOARD' },
  { id: 'kpi_conversieratio', label: 'Conversieratio', sub: '% conversie', type: 'input', page: 6, group: 'KPI DASHBOARD' },
  { id: 'kpi_klantaandeel', label: '% Klantaandeel', sub: 'Aandeel bij bestaande klanten', type: 'input', page: 6, group: 'KPI DASHBOARD' },
  { id: 'kpi_klantretentie', label: '% Klantretentie', sub: 'Klantbehoud %', type: 'input', page: 6, group: 'KPI DASHBOARD' },
  { id: 'kpi_forecast', label: '% Behaalde Forecast', sub: 'Forecastnauwkeurigheid', type: 'input', page: 6, group: 'KPI DASHBOARD' },
  { id: 'kpi_ordergrootte', label: '€ Gem. Ordergrootte', sub: 'Gemiddelde dealwaarde', type: 'input', page: 6, group: 'KPI DASHBOARD' },
  { id: 'kpi_nieuwe_logos', label: "# Nieuwe Logo's", sub: 'Nieuwe klanten', type: 'input', page: 6, group: 'KPI DASHBOARD' },
  { id: 'kpi_omzet', label: '€ Omzet', sub: 'Omzetdoelstelling', type: 'input', page: 6, group: 'KPI DASHBOARD' },
  { id: 'kpi_winst', label: '€/% Winst', sub: 'Winstdoelstelling', type: 'input', page: 6, group: 'KPI DASHBOARD' },
  { id: 'kpi_referrals', label: '# Referrals', sub: 'Aantal referrals', type: 'input', page: 6, group: 'KPI DASHBOARD' },
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
  groupCard: { borderTop: '1px solid #EE7700', paddingTop: '20px' } as React.CSSProperties,
  groupTitle: { fontFamily: 'var(--font-bebas), sans-serif', color: '#EE7700', fontSize: '16px', letterSpacing: '3px', marginBottom: '20px' } as React.CSSProperties,
  groupField: { marginBottom: '16px' } as React.CSSProperties,
  label: { color: '#EE7700', fontSize: '11px', letterSpacing: '3px', marginBottom: '4px' } as React.CSSProperties,
  groupLabel: { color: '#f0ede6', fontSize: '11px', letterSpacing: '2px', marginBottom: '4px', opacity: 0.6 } as React.CSSProperties,
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

  const renderField = (section: Field, inGroup = false) => {
    const isLoading = arnobotLoading[section.id]
    const feedback = arnobotFeedback[section.id]
    const hasAnswer = !!(answers[section.id] || '').trim()
    return (
      <div key={section.id} style={inGroup ? styles.groupField : styles.card}>
        <p style={inGroup ? styles.groupLabel : styles.label}>{section.label}</p>
        {!inGroup && <p style={styles.sub}>{section.sub}</p>}
        {section.type === 'textarea' ? (
          <textarea style={styles.textarea} value={answers[section.id] || ''} onChange={e => handleChange(section.id, e.target.value)} onBlur={() => handleBlur(section.id)} placeholder="..." />
        ) : (
          <input style={styles.input} value={answers[section.id] || ''} onChange={e => handleChange(section.id, e.target.value)} onBlur={() => handleBlur(section.id)} placeholder="..." />
        )}
        {hasAnswer && !inGroup && (
          <button style={isLoading ? styles.arnobotBtnLoading : styles.arnobotBtn} onClick={async () => {
            setArnobotLoading(prev => ({ ...prev, [section.id]: true }))
            setArnobotFeedback(prev => ({ ...prev, [section.id]: '' }))
            try {
              const fb = await getArnoBotFeedback(section.label, section.sub, answers[section.id] || '')
              setArnobotFeedback(prev => ({ ...prev, [section.id]: fb }))
            } catch {
              setArnobotFeedback(prev => ({ ...prev, [section.id]: 'ArnoBot is tijdelijk niet beschikbaar.' }))
            } finally {
              setArnobotLoading(prev => ({ ...prev, [section.id]: false }))
            }
          }} onMouseEnter={e => { if (!isLoading) (e.target as HTMLElement).style.opacity = '1' }} onMouseLeave={e => { if (!isLoading) (e.target as HTMLElement).style.opacity = '0.5' }}>
            {isLoading ? '→ ARNOBOT DENKT...' : feedback ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
          </button>
        )}
        {feedback && !isLoading && !inGroup && <div style={styles.arnobotBox}>{feedback}</div>}
      </div>
    )
  }

  const renderPage = (page: number) => {
    const fields = SECTIONS.filter(s => s.page === page)
    const rendered: React.ReactNode[] = []
    const seenGroups = new Set<string>()

    fields.forEach(field => {
      if (field.group) {
        if (seenGroups.has(field.group)) return
        seenGroups.add(field.group)
        const groupFields = fields.filter(f => f.group === field.group)
        const groupIsLoading = arnobotLoading[`group_${field.group}`]
        const groupFeedback = arnobotFeedback[`group_${field.group}`]
        const groupHasAnswer = groupFields.some(f => !!(answers[f.id] || '').trim())

        rendered.push(
          <div key={field.group} style={styles.groupCard}>
            <p style={styles.groupTitle}>{field.group}</p>
            {groupFields.map(f => renderField(f, true))}
            {groupHasAnswer && (
              <button style={groupIsLoading ? styles.arnobotBtnLoading : styles.arnobotBtn}
                onClick={async () => {
                  if (groupIsLoading) return
                  const combined = groupFields.map(f => `${f.label}: ${answers[f.id] || ''}`).join('\n')
                  setArnobotLoading(prev => ({ ...prev, [`group_${field.group}`]: true }))
                  setArnobotFeedback(prev => ({ ...prev, [`group_${field.group}`]: '' }))
                  try {
                    const fb = await getArnoBotFeedback(field.group!, field.group!, combined)
                    setArnobotFeedback(prev => ({ ...prev, [`group_${field.group}`]: fb }))
                  } catch {
                    setArnobotFeedback(prev => ({ ...prev, [`group_${field.group}`]: 'ArnoBot is tijdelijk niet beschikbaar.' }))
                  } finally {
                    setArnobotLoading(prev => ({ ...prev, [`group_${field.group}`]: false }))
                  }
                }}
                onMouseEnter={e => { if (!groupIsLoading) (e.target as HTMLElement).style.opacity = '1' }}
                onMouseLeave={e => { if (!groupIsLoading) (e.target as HTMLElement).style.opacity = '0.5' }}>
                {groupIsLoading ? '→ ARNOBOT DENKT...' : groupFeedback ? '→ OPNIEUW VRAGEN' : '→ ARNOBOT'}
              </button>
            )}
            {groupFeedback && !groupIsLoading && <div style={styles.arnobotBox}>{groupFeedback}</div>}
          </div>
        )
      } else {
        rendered.push(renderField(field))
      }
    })

    return rendered
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
      <div style={styles.grid}>{renderPage(5)}</div>
      <div style={styles.divider}>PAGINA 06 — KPI DASHBOARD</div>
      <div style={styles.grid}>{renderPage(6)}</div>
      {saveStatus && <p style={styles.saveStatus}>{saveStatus}</p>}
    </main>
  )
}