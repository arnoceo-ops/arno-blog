// @ts-nocheck
'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase'
import dynamic from 'next/dynamic'

// Dynamisch laden zodat @react-pdf/renderer niet server-side rendert
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(m => m.PDFDownloadLink),
  { ssr: false }
)

// Dynamisch de doc importeren (zelfde reden)
const CanvasPdfDocumentDynamic = dynamic(
  () => import('./canvas/CanvasPdfDocument').then(m => m.CanvasPdfDocument),
  { ssr: false }
)

export default function PdfExportButton() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const [pdfData, setPdfData] = useState<null | {
    answers: any[]
    healthScore: number
    kwaliteitsScore: number | null
    userName: string
    laatsteAnalyse: Date | null
  }>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  const TOTAL_FIELDS = {
    strategie: ['missie','cultuur_1','cultuur_2','cultuur_3','cultuur_4','cultuur_5','waardepropositie','kerncompetenties','dienstverlening','zandbak','doelen_datum','doelen_omzet','doelen_winst','doelen_klanten','doelen_marktaandeel','doelen_liquiditeit','acties_datum','acties_omzet','acties_winst','acties_brutomarge','acties_cash','acties_klanten','leiderschap_markten','leiderschap_wanneer','merkbelofte','strategie_1_zin','onderscheidend_1','onderscheidend_2','onderscheidend_3','onderscheidend_4','onderscheidend_5','xfactor','winst_per_eenheid','moonshots','schaalbaarheid','repeterende_omzet','klantretentie','referrals','omtm'],
    mensen: ['aantrekkingskracht','profielen','wervingskanalen','selectieproces','behoud_sterspelers','verkopers_q1','verkopers_q2','verkopers_q3','verkopers_q4','werving_selectie','onboarding','tijd_rendement','actieplan'],
    uitvoering: ['kwartaal_jaar','themanaam','meetbaar_doel','cruciale_kpi','okr_wat_1','okr_hoe_1','okr_wie_1','okr_wat_2','okr_hoe_2','okr_wie_2','okr_wat_3','okr_hoe_3','okr_wie_3','klanten_krijgen_1','klanten_krijgen_2','klanten_krijgen_3','klanten_uitbouwen_1','klanten_uitbouwen_2','klanten_uitbouwen_3','klanten_houden_1','klanten_houden_2','klanten_houden_3','numbers_leads','numbers_bezoeken','numbers_offertes','numbers_orders','numbers_referrals','wensenlijst','kpi_verkoopcyclus','kpi_omzet','kpi_winst','verkoopproces','feestje','beloning'],
  }

  const WEIGHTS = { strategie: 0.30, mensen: 0.40, uitvoering: 0.30 }

  const QUESTION_WEIGHTS: Record<string, number> = {
    strategie_missie: 3, strategie_waardepropositie: 3, strategie_strategie_1_zin: 3,
    strategie_xfactor: 3, strategie_merkbelofte: 3, strategie_kerncompetenties: 3,
    mensen_aantrekkingskracht: 3, mensen_profielen: 3, mensen_behoud_sterspelers: 3,
    mensen_onboarding: 3, mensen_actieplan: 3,
    uitvoering_themanaam: 3, uitvoering_meetbaar_doel: 3, uitvoering_cruciale_kpi: 3,
    uitvoering_verkoopproces: 3,
  }

  function getQuestionWeight(qid: string): number {
    return QUESTION_WEIGHTS[qid] ?? 2
  }

  function berekenGewogenScore(rows: { question_id: string; score: number }[]): number {
    if (rows.length === 0) return 0
    let totalWeight = 0, weightedSum = 0
    for (const row of rows) {
      const w = getQuestionWeight(row.question_id)
      weightedSum += (row.score / 5) * w
      totalWeight += w
    }
    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }

  function berekenKwaliteitsScore(data: { question_id: string; score: number | null }[]): number {
    const scored = data.filter(r => r.score !== null && r.score !== undefined) as { question_id: string; score: number }[]
    const segRows: Record<string, { question_id: string; score: number }[]> = { strategie: [], mensen: [], uitvoering: [] }
    for (const row of scored) {
      const seg = row.question_id.split('_')[0]
      if (segRows[seg]) segRows[seg].push(row)
    }
    const weighted =
      berekenGewogenScore(segRows.strategie) * WEIGHTS.strategie +
      berekenGewogenScore(segRows.mensen) * WEIGHTS.mensen +
      berekenGewogenScore(segRows.uitvoering) * WEIGHTS.uitvoering
    return Math.round(weighted * 100)
  }

  async function prepare() {
    if (!user) return
    setLoading(true)

    try {
      // Antwoorden ophalen
      const { data: answerRows } = await supabase
        .from('canvas_answers')
        .select('question_id, answer, score')
        .eq('user_id', user.id)

      const answers = answerRows || []

      // Volledigheid berekenen
      const allFields = Object.entries(TOTAL_FIELDS).flatMap(([prefix, ids]) =>
        ids.map(id => `${prefix}_${id}`)
      )
      const filled = answers.filter(r => allFields.includes(r.question_id) && r.answer?.trim()).length
      const healthScore = Math.round((filled / allFields.length) * 100)

      // Kwaliteitsscore
      const scored = answers.filter(r => r.score !== null && r.score !== undefined)
      const kwaliteitsScore = scored.length > 0 ? berekenKwaliteitsScore(scored) : null

      // Laatste analyse timestamp (via score kolom — als er scores zijn nemen we now als proxy)
      // In productie kun je een aparte analyse_timestamp kolom toevoegen
      const hasScores = scored.length > 0
      const laatsteAnalyse = hasScores ? new Date() : null

      setPdfData({
        answers,
        healthScore,
        kwaliteitsScore,
        userName: user.firstName || user.emailAddresses?.[0]?.emailAddress || 'Gebruiker',
        laatsteAnalyse,
      })
      setReady(true)
    } catch (e) {
      console.error('PDF prep error:', e)
    } finally {
      setLoading(false)
    }
  }

  const btnStyle = {
    padding: '12px 28px',
    backgroundColor: loading ? '#1a1a1a' : '#EE7700',
    color: loading ? '#444' : '#0a0a0a',
    border: 'none',
    fontFamily: 'var(--font-bebas), sans-serif',
    fontSize: '18px',
    letterSpacing: '3px',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    display: 'inline-block',
  } as React.CSSProperties

  // Stap 1: data ophalen en PDF klaarzetten
  if (!ready) {
    return (
      <button onClick={prepare} disabled={loading} style={btnStyle}>
        {loading ? 'LADEN...' : '↓ EXPORT PDF'}
      </button>
    )
  }

  // Stap 2: PDF download link tonen (client-side rendering door react-pdf)
  return (
    <PDFDownloadLink
      document={
        <CanvasPdfDocumentDynamic
          answers={pdfData!.answers}
          healthScore={pdfData!.healthScore}
          kwaliteitsScore={pdfData!.kwaliteitsScore}
          userName={pdfData!.userName}
          laatsteAnalyse={pdfData!.laatsteAnalyse}
        />
      }
      fileName={`rds-canvas-${new Date().getFullYear()}.pdf`}
      style={btnStyle}
    >
      {({ loading: pdfLoading }) =>
        pdfLoading ? 'PDF GENEREREN...' : '↓ DOWNLOAD PDF'
      }
    </PDFDownloadLink>
  )
}
