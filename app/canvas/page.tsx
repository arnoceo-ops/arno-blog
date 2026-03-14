// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PdfExportButton from '@/components/PdfExportButton'

const TOTAL_FIELDS = {
  strategie: ['missie','cultuur_1','cultuur_2','cultuur_3','cultuur_4','cultuur_5','waardepropositie','kerncompetenties','dienstverlening','zandbak','doelen_datum','doelen_omzet','doelen_winst','doelen_klanten','doelen_marktaandeel','doelen_liquiditeit','acties_datum','acties_omzet','acties_winst','acties_brutomarge','acties_cash','acties_klanten','leiderschap_markten','leiderschap_wanneer','merkbelofte','strategie_1_zin','onderscheidend_1','onderscheidend_2','onderscheidend_3','onderscheidend_4','onderscheidend_5','xfactor','winst_per_eenheid','moonshots','schaalbaarheid','repeterende_omzet','klantretentie','referrals','omtm'],
  mensen: ['aantrekkingskracht','profielen','wervingskanalen','selectieproces','behoud_sterspelers','verkopers_q1','verkopers_q2','verkopers_q3','verkopers_q4','werving_selectie','onboarding','tijd_rendement','actieplan'],
  uitvoering: ['kwartaal_jaar','themanaam','meetbaar_doel','cruciale_kpi','okr_wat_1','okr_hoe_1','okr_wie_1','okr_wat_2','okr_hoe_2','okr_wie_2','okr_wat_3','okr_hoe_3','okr_wie_3','klanten_krijgen_1','klanten_krijgen_2','klanten_krijgen_3','klanten_uitbouwen_1','klanten_uitbouwen_2','klanten_uitbouwen_3','klanten_houden_1','klanten_houden_2','klanten_houden_3','numbers_leads','numbers_bezoeken','numbers_offertes','numbers_orders','numbers_referrals','conversie_leads_bezoeken','conversie_bezoeken_offertes','conversie_offertes_orders','wensenlijst','kpi_verkoopcyclus','kpi_conversieratio','kpi_klantaandeel','kpi_klantretentie','kpi_forecast','kpi_ordergrootte','kpi_nieuwe_logos','kpi_omzet','kpi_winst','kpi_referrals','verkoopproces','feestje','beloning'],
}

const ALL_TOTAL = Object.values(TOTAL_FIELDS).flat().length

// Gewichten kwaliteitsscore
const WEIGHTS = { strategie: 0.30, mensen: 0.40, uitvoering: 0.30 }

function getScoreLabel(score: number) {
  if (score < 25) return 'ONVOLLEDIG'
  if (score < 50) return 'IN OPBOUW'
  if (score < 75) return 'GEVORDERD'
  if (score < 100) return 'BIJNA KLAAR'
  return 'COMPLEET'
}

function getKwaliteitLabel(score: number | null) {
  if (score === null) return ''
  if (score < 25) return 'ZWAK'
  if (score < 50) return 'MATIG'
  if (score < 75) return 'SOLIDE'
  if (score < 90) return 'STERK'
  return 'UITSTEKEND'
}

const SECTIONS = [
  { key: 'strategie' as const, pages: '01 — 02', title: 'STRATEGIE' },
  { key: 'mensen' as const, pages: '03 — 04', title: 'MENSEN' },
  { key: 'uitvoering' as const, pages: '05 — 06', title: 'UITVOERING' },
]

export default function CanvasPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const [scores, setScores] = useState({ strategie: 0, mensen: 0, uitvoering: 0 })
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState<string | null>(null)
  const [approved, setApproved] = useState<boolean | null>(null)

  // Plan Health Score (kwaliteit)
  const [kwaliteitsScore, setKwaliteitsScore] = useState<number | null>(null)
  const [analysing, setAnalysing] = useState(false)
  const [analyseProgress, setAnalyseProgress] = useState<string>('')

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in')
  }, [isLoaded, user, router])

  useEffect(() => {
    if (!user) return
    const checkApproval = async () => {
      const now = new Date().toISOString()
      const { data } = await supabase
        .from('approved_users')
        .select('id, expires_at')
        .eq('user_id', user.id)
        .single()
      if (!data) { setApproved(false); return }
      if (data.expires_at && data.expires_at < now) { setApproved(false); return }
      setApproved(true)
    }
    checkApproval()
  }, [user])

  useEffect(() => {
    if (!user || approved !== true) return
    const load = async () => {
      const allIds = [
        ...TOTAL_FIELDS.strategie.map(id => `strategie_${id}`),
        ...TOTAL_FIELDS.mensen.map(id => `mensen_${id}`),
        ...TOTAL_FIELDS.uitvoering.map(id => `uitvoering_${id}`),
      ]
      const { data } = await supabase
        .from('canvas_answers')
        .select('question_id, answer, score')
        .eq('user_id', user.id)
        .in('question_id', allIds)

      if (data) {
        const filled = new Set(data.filter(r => r.answer?.trim()).map(r => r.question_id))
        setScores({
          strategie: TOTAL_FIELDS.strategie.filter(id => filled.has(`strategie_${id}`)).length,
          mensen: TOTAL_FIELDS.mensen.filter(id => filled.has(`mensen_${id}`)).length,
          uitvoering: TOTAL_FIELDS.uitvoering.filter(id => filled.has(`uitvoering_${id}`)).length,
        })

        // Herstel eerder berekende kwaliteitscore als die al bestaat
        const scored = data.filter(r => r.score !== null && r.score !== undefined)
        if (scored.length > 0) {
          const segScores: Record<string, number[]> = { strategie: [], mensen: [], uitvoering: [] }
          for (const row of scored) {
            const seg = row.question_id.split('_')[0] as keyof typeof WEIGHTS
            if (segScores[seg]) segScores[seg].push(row.score)
          }
          const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
          const weighted =
            (avg(segScores.strategie) / 5) * WEIGHTS.strategie +
            (avg(segScores.mensen) / 5) * WEIGHTS.mensen +
            (avg(segScores.uitvoering) / 5) * WEIGHTS.uitvoering
          setKwaliteitsScore(Math.round(weighted * 100))
        }
      }
      setLoading(false)
    }
    load()
  }, [user, approved])

  // Analyseer plan — scoort alle antwoorden via ArnoBot
  const analyseerPlan = async () => {
    if (!user) return
    setAnalysing(true)
    setAnalyseProgress('Antwoorden ophalen...')

    const allIds = [
      ...TOTAL_FIELDS.strategie.map(id => `strategie_${id}`),
      ...TOTAL_FIELDS.mensen.map(id => `mensen_${id}`),
      ...TOTAL_FIELDS.uitvoering.map(id => `uitvoering_${id}`),
    ]

    const { data: answers } = await supabase
      .from('canvas_answers')
      .select('question_id, answer, score')
      .eq('user_id', user.id)
      .in('question_id', allIds)

    const toScore = (answers ?? []).filter(r => r.answer?.trim() && !r.score)

    if (toScore.length === 0 && (answers ?? []).length === 0) {
      setAnalyseProgress('Geen antwoorden gevonden.')
      setAnalysing(false)
      return
    }

    let done = 0
    for (const row of toScore) {
      setAnalyseProgress(`Analyseren ${++done} / ${toScore.length}...`)
      try {
        const res = await fetch('/api/arnobot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'score',
            questionId: row.question_id,
            answer: row.answer,
          }),
        })
        const { score } = await res.json()
        if (score) {
          await supabase
            .from('canvas_answers')
            .update({ score })
            .eq('user_id', user.id)
            .eq('question_id', row.question_id)
        }
      } catch {
        // skip dit antwoord bij fout, ga door
      }
    }

    // Herbereken score op basis van alle gescoorde rijen (oud + nieuw)
    setAnalyseProgress('Score berekenen...')
    const { data: allScored } = await supabase
      .from('canvas_answers')
      .select('question_id, score')
      .eq('user_id', user.id)
      .not('score', 'is', null)

    const segScores: Record<string, number[]> = { strategie: [], mensen: [], uitvoering: [] }
    for (const row of allScored ?? []) {
      const seg = row.question_id.split('_')[0] as keyof typeof WEIGHTS
      if (segScores[seg]) segScores[seg].push(row.score)
    }

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
    const weighted =
      (avg(segScores.strategie) / 5) * WEIGHTS.strategie +
      (avg(segScores.mensen) / 5) * WEIGHTS.mensen +
      (avg(segScores.uitvoering) / 5) * WEIGHTS.uitvoering

    setKwaliteitsScore(Math.round(weighted * 100))
    setAnalyseProgress('')
    setAnalysing(false)
  }

  const totalFilled = scores.strategie + scores.mensen + scores.uitvoering
  const healthScore = Math.round((totalFilled / ALL_TOTAL) * 100)
  const scoreLabel = getScoreLabel(healthScore)

  const sectionScore = (segment: keyof typeof TOTAL_FIELDS) =>
    Math.round((scores[segment] / TOTAL_FIELDS[segment].length) * 100)

  if (!isLoaded || !user) return null

  if (approved === false) {
    return (
      <main style={{
        backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#f0ede6',
        fontFamily: 'var(--font-geist-sans), sans-serif',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '64px 48px', textAlign: 'center',
      }}>
        <p style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '4px', marginBottom: '24px', opacity: 0.7 }}>
          ROYAL DUTCH SALES
        </p>
        <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '64px', letterSpacing: '4px', color: '#f0ede6', margin: '0 0 24px 0', lineHeight: 1 }}>
          TOEGANG AANVRAGEN
        </h1>
        <p style={{ color: '#f0ede6', opacity: 0.4, fontSize: '15px', maxWidth: '480px', lineHeight: 1.8, marginBottom: '40px' }}>
          Jouw account wacht op goedkeuring. Neem contact op via{' '}
          <a href="mailto:arno@royaldutchsales.com" style={{ color: '#EE7700', textDecoration: 'none' }}>
            arno@royaldutchsales.com
          </a>{' '}
          om toegang te krijgen tot RDS Canvas.
        </p>
        <Link href="/" style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '3px', textDecoration: 'none', opacity: 0.6 }}>
          ← TERUG NAAR HOME
        </Link>
      </main>
    )
  }

  if (approved === null) return null

  return (
    <main style={{
      backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#f0ede6',
      fontFamily: 'var(--font-geist-sans), sans-serif', padding: '64px 48px',
    }}>
      {/* HEADER */}
      <div style={{ marginBottom: '80px' }}>
        <p style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '4px', marginBottom: '12px', opacity: 0.7 }}>
          ROYAL DUTCH SALES
        </p>
        <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '96px', letterSpacing: '6px', color: '#f0ede6', margin: '0 0 8px 0', lineHeight: 1 }}>
          RDS CANVAS
        </h1>
        <p style={{ color: '#f0ede6', opacity: 0.35, fontSize: '13px', letterSpacing: '1px' }}>
          {user.firstName} — Verkoopplan {new Date().getFullYear()}
        </p>
      </div>

      {/* SCORES BLOK */}
      <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: '48px', marginBottom: '80px' }}>

        {/* Volledigheid */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', marginBottom: '16px' }}>
            <span style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '4px' }}>VOLLEDIGHEID</span>
            <span style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '2px', opacity: 0.4 }}>
              {loading ? '...' : scoreLabel}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '120px', color: '#f0ede6', lineHeight: 1, marginBottom: '24px', letterSpacing: '2px' }}>
            {loading ? '—' : `${healthScore}%`}
          </div>
          <div style={{ width: '100%', height: '2px', backgroundColor: '#1a1a1a', marginBottom: '32px' }}>
            <div style={{ height: '2px', width: loading ? '0%' : `${healthScore}%`, backgroundColor: '#EE7700', transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Kwaliteitsscore */}
        <div style={{ marginBottom: '48px', paddingTop: '32px', borderTop: '1px solid #1e1e1e' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', marginBottom: '16px' }}>
            <span style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '4px' }}>PLAN KWALITEIT</span>
            {kwaliteitsScore !== null && (
              <span style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '2px', opacity: 0.4 }}>
                {getKwaliteitLabel(kwaliteitsScore)}
              </span>
            )}
            <span style={{ color: '#f0ede6', fontSize: '10px', letterSpacing: '2px', opacity: 0.25, marginLeft: 'auto' }}>
              MENSEN 40% · STRATEGIE 30% · UITVOERING 30%
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '40px' }}>
            <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '120px', color: kwaliteitsScore !== null ? '#f0ede6' : '#1e1e1e', lineHeight: 1, letterSpacing: '2px' }}>
              {kwaliteitsScore !== null ? `${kwaliteitsScore}%` : '—'}
            </div>

            <div style={{ paddingBottom: '16px' }}>
              <button
                onClick={analyseerPlan}
                disabled={analysing}
                style={{
                  padding: '12px 28px',
                  backgroundColor: analysing ? '#1a1a1a' : '#EE7700',
                  color: analysing ? '#444' : '#0a0a0a',
                  border: 'none',
                  fontFamily: 'var(--font-bebas), sans-serif',
                  fontSize: '18px',
                  letterSpacing: '3px',
                  cursor: analysing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {analysing ? (analyseProgress || 'ANALYSEREN...') : 'ANALYSEER PLAN'}
              </button>
              {kwaliteitsScore !== null && !analysing && (
                <p style={{ color: '#f0ede6', fontSize: '10px', opacity: 0.25, letterSpacing: '2px', marginTop: '8px' }}>
                  OPNIEUW ANALYSEREN OVERSCHRIJFT VORIGE SCORES
                </p>
              )}
            </div>
          </div>

          {kwaliteitsScore !== null && (
            <div style={{ width: '100%', height: '2px', backgroundColor: '#1a1a1a', marginTop: '16px' }}>
              <div style={{ height: '2px', width: `${kwaliteitsScore}%`, backgroundColor: '#EE7700', transition: 'width 1s ease' }} />
            </div>
          )}
        </div>

        {/* Sectie breakdown + PDF */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '64px' }}>
            {SECTIONS.map(s => (
              <div key={s.key}>
                <p style={{ color: '#EE7700', fontSize: '10px', letterSpacing: '3px', marginBottom: '6px' }}>{s.title}</p>
                <p style={{ color: '#f0ede6', fontSize: '13px', opacity: 0.5, letterSpacing: '1px' }}>
                  {loading ? '—' : `${scores[s.key]} / ${TOTAL_FIELDS[s.key].length}`}
                </p>
              </div>
            ))}
          </div>
          <PdfExportButton />
        </div>
      </div>

      {/* SECTIE KAARTEN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
        {SECTIONS.map(s => {
          const pct = sectionScore(s.key)
          const isHovered = hovered === s.key
          const isComplete = pct === 100
          return (
            <Link key={s.key} href={`/canvas/${s.key}`} style={{ textDecoration: 'none' }}>
              <div
                onMouseEnter={() => setHovered(s.key)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  padding: '40px 32px',
                  backgroundColor: isHovered ? '#111' : '#0a0a0a',
                  border: '1px solid',
                  borderColor: isComplete ? '#EE7700' : isHovered ? '#444' : '#1e1e1e',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  minHeight: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <p style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '3px', marginBottom: '12px', opacity: 0.6 }}>{s.pages}</p>
                  <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', color: '#f0ede6', fontSize: '48px', letterSpacing: '3px', margin: '0 0 8px 0', lineHeight: 1 }}>
                    {s.title}
                  </h2>
                  <p style={{ color: '#f0ede6', opacity: 0.3, fontSize: '12px', letterSpacing: '1px' }}>
                    {TOTAL_FIELDS[s.key].length} velden
                  </p>
                </div>
                {!loading && (
                  <div style={{ marginTop: '32px' }}>
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#1e1e1e', marginBottom: '10px' }}>
                      <div style={{ height: '1px', width: `${pct}%`, backgroundColor: '#EE7700', transition: 'width 0.8s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '2px', opacity: 0.5 }}>{pct}%</span>
                      {isHovered && (
                        <span style={{ color: '#EE7700', fontSize: '10px', letterSpacing: '2px', opacity: 0.5 }}>OPEN →</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}