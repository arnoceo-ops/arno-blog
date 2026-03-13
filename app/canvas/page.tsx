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

function getScoreLabel(score: number) {
  if (score < 25) return 'ONVOLLEDIG'
  if (score < 50) return 'IN OPBOUW'
  if (score < 75) return 'GEVORDERD'
  if (score < 100) return 'BIJNA KLAAR'
  return 'COMPLEET'
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

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in')
  }, [isLoaded, user, router])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const allIds = [
        ...TOTAL_FIELDS.strategie.map(id => `strategie_${id}`),
        ...TOTAL_FIELDS.mensen.map(id => `mensen_${id}`),
        ...TOTAL_FIELDS.uitvoering.map(id => `uitvoering_${id}`),
      ]
      const { data } = await supabase
        .from('canvas_answers')
        .select('question_id, answer')
        .eq('user_id', user.id)
        .in('question_id', allIds)

      if (data) {
        const filled = new Set(data.filter(r => r.answer?.trim()).map(r => r.question_id))
        setScores({
          strategie: TOTAL_FIELDS.strategie.filter(id => filled.has(`strategie_${id}`)).length,
          mensen: TOTAL_FIELDS.mensen.filter(id => filled.has(`mensen_${id}`)).length,
          uitvoering: TOTAL_FIELDS.uitvoering.filter(id => filled.has(`uitvoering_${id}`)).length,
        })
      }
      setLoading(false)
    }
    load()
  }, [user])

  const totalFilled = scores.strategie + scores.mensen + scores.uitvoering
  const healthScore = Math.round((totalFilled / ALL_TOTAL) * 100)
  const scoreLabel = getScoreLabel(healthScore)

  const sectionScore = (segment: keyof typeof TOTAL_FIELDS) =>
    Math.round((scores[segment] / TOTAL_FIELDS[segment].length) * 100)

  if (!isLoaded || !user) return null

  return (
    <main style={{
      backgroundColor: '#0a0a0a',
      minHeight: '100vh',
      color: '#f0ede6',
      fontFamily: 'var(--font-geist-sans), sans-serif',
      padding: '64px 48px',
    }}>
      <div style={{ marginBottom: '80px' }}>
        <p style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '4px', marginBottom: '12px', opacity: 0.7 }}>
          ROYAL DUTCH SALES
        </p>
        <h1 style={{
          fontFamily: 'var(--font-bebas), sans-serif',
          fontSize: '96px',
          letterSpacing: '6px',
          color: '#f0ede6',
          margin: '0 0 8px 0',
          lineHeight: 1,
        }}>
          RDS CANVAS
        </h1>
        <p style={{ color: '#f0ede6', opacity: 0.35, fontSize: '13px', letterSpacing: '1px' }}>
          {user.firstName} — Verkoopplan {new Date().getFullYear()}
        </p>
      </div>

      <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: '48px', marginBottom: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', marginBottom: '16px' }}>
          <span style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '4px' }}>PLAN HEALTH SCORE</span>
          <span style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '2px', opacity: 0.4 }}>
            {loading ? '...' : scoreLabel}
          </span>
        </div>
        <div style={{
          fontFamily: 'var(--font-bebas), sans-serif',
          fontSize: '120px',
          color: '#f0ede6',
          lineHeight: 1,
          marginBottom: '24px',
          letterSpacing: '2px',
        }}>
          {loading ? '—' : `${healthScore}%`}
        </div>
        <div style={{ width: '100%', height: '2px', backgroundColor: '#1a1a1a', marginBottom: '32px' }}>
          <div style={{
            height: '2px',
            width: loading ? '0%' : `${healthScore}%`,
            backgroundColor: '#EE7700',
            transition: 'width 1s ease',
          }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '64px' }}>
            {SECTIONS.map(s => (
              <div key={s.key}>
                <p style={{ color: '#EE7700', fontSize: '10px', letterSpacing: '3px', marginBottom: '6px' }}>
                  {s.title}
                </p>
                <p style={{ color: '#f0ede6', fontSize: '13px', opacity: 0.5, letterSpacing: '1px' }}>
                  {loading ? '—' : `${scores[s.key]} / ${TOTAL_FIELDS[s.key].length}`}
                </p>
              </div>
            ))}
          </div>
          <PdfExportButton />
        </div>
      </div>

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
                  <p style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '3px', marginBottom: '12px', opacity: 0.6 }}>
                    {s.pages}
                  </p>
                  <h2 style={{
                    fontFamily: 'var(--font-bebas), sans-serif',
                    color: '#f0ede6',
                    fontSize: '48px',
                    letterSpacing: '3px',
                    margin: '0 0 8px 0',
                    lineHeight: 1,
                  }}>
                    {s.title}
                  </h2>
                  <p style={{ color: '#f0ede6', opacity: 0.3, fontSize: '12px', letterSpacing: '1px' }}>
                    {TOTAL_FIELDS[s.key].length} velden
                  </p>
                </div>
                {!loading && (
                  <div style={{ marginTop: '32px' }}>
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#1e1e1e', marginBottom: '10px' }}>
                      <div style={{
                        height: '1px',
                        width: `${pct}%`,
                        backgroundColor: '#EE7700',
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#EE7700', fontSize: '11px', letterSpacing: '2px', opacity: 0.5 }}>
                        {pct}%
                      </span>
                      {isHovered && (
                        <span style={{ color: '#EE7700', fontSize: '10px', letterSpacing: '2px', opacity: 0.5 }}>
                          OPEN →
                        </span>
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
