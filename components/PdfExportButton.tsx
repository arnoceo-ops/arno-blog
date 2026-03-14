// @ts-nocheck
'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase'

import dynamic from 'next/dynamic'

const PDFDownloadLink = dynamic(
  async () => {
    const { PDFDownloadLink } = await import('@react-pdf/renderer')
    return PDFDownloadLink
  },
  { ssr: false, loading: () => <span>...</span> }
)

const CanvasPdfDocumentDynamic = dynamic(
  async () => {
    const mod = await import('@/components/canvas/CanvasPdfDocument')
    return mod.CanvasPdfDocument
  },
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
    uitvoering: ['kwartaal_jaar','themanaam','meetbaar_doel','cruciale_kpi','okr_wat_1','okr_hoe_1','okr_wie_1','okr_wat_2','okr_hoe_2','okr_wie_2','okr_wat_3','okr_hoe_3','okr_wie_3','klanten_krijgen_1','klanten_krijgen_2','klanten_krijgen_3','klanten_uitbouwen_1','klanten_uitbouwen_2','klanten_uitbouwen_3','klanten_houden_1','klanten_houden_2','klanten_houden_3','numbers_leads','numbers_bezoeken','numbers_offertes','numbers_orders','numbers_referrals','conversie_leads_bezoeken','conversie_bezoeken_offertes','conversie_offertes_orders','wensenlijst','kpi_verkoopcyclus','kpi_conversieratio','kpi_klantaandeel','kpi_klantretentie','kpi_forecast','kpi_ordergrootte','kpi_nieuwe_logos','kpi_omzet','kpi_winst','kpi_referrals','verkoopproces','feestje','beloning'],
  }

  const WEIGHTS = { strategie: 0.30, mensen: 0.40, uitvoering: 0.30 }

  const QUESTION_WEIGHTS: Record<string, number> = {
    strategie_missie: 3, strategie_waardepropositie: 3, strategie_strategie_1_zin: 3,
    strategie_xfactor: 3, strategie_merkbelofte: 3, strategie_kerncompetenties: 3,
    strategie_onderscheidend_1: 3, strategie_onderscheidend_2: 3, strategie_onderscheidend_3: 3,
    strategie_onderscheidend_4: 3, strategie_onderscheidend_5: 3,
    strategie_zandbak: 2, strategie_dienstverlening: 2, strategie_moonshots: 2,
    strategie_schaalbaarheid: 2, strategie_repeterende_omzet: 2, strategie_klantretentie: 2,
    strategie_referrals: 2, strategie_omtm: 2, strategie_winst_per_eenheid: 2,
    strategie_leiderschap_markten: 2, strategie_leiderschap_wanneer: 2,
    strategie_cultuur_1: 2, strategie_cultuur_2: 2, strategie_cultuur_3: 2,
    strategie_cultuur_4: 2, strategie_cultuur_5: 2,
    strategie_doelen_omzet: 2, strategie_doelen_winst: 2, strategie_doelen_klanten: 2,
    strategie_doelen_marktaandeel: 2, strategie_doelen_liquiditeit: 2,
    strategie_acties_omzet: 2, strategie_acties_winst: 2, strategie_acties_brutomarge: 2,
    strategie_acties_cash: 2, strategie_acties_klanten: 2,
    strategie_doelen_datum: 1, strategie_acties_datum: 1,
    mensen_aantrekkingskracht: 3, mensen_profielen: 3, mensen_behoud_sterspelers: 3,
    mensen_onboarding: 3, mensen_actieplan: 3,
    mensen_wervingskanalen: 2, mensen_selectieproces: 2, mensen_werving_selectie: 2,
    mensen_tijd_rendement: 2,
    mensen_verkopers_q1: 1, mensen_verkopers_q2: 1, mensen_verkopers_q3: 1, mensen_verkopers_q4: 1,
    uitvoering_themanaam: 3, uitvoering_meetbaar_doel: 3, uitvoering_cruciale_kpi: 3,
    uitvoering_verkoopproces: 3,
    uitvoering_okr_wat_1: 3, uitvoering_okr_wat_2: 3, uitvoering_okr_wat_3: 3,
    uitvoering_okr_hoe_1: 3, uitvoering_okr_hoe_2: 3, uitvoering_okr_hoe_3: 3,
    uitvoering_wensenlijst: 2,
    uitvoering_klanten_krijgen_1: 2, uitvoering_klanten_krijgen_2: 2, uitvoering_klanten_krijgen_3: 2,
    uitvoering_klanten_uitbouwen_1: 2, uitvoering_klanten_uitbouwen_2: 2, uitvoering_klanten_uitbouwen_3: 2,
    uitvoering_klanten_houden_1: 2, uitvoering_klanten_houden_2: 2, uitvoering_klanten_houden_3: 2,
    uitvoering_kpi_verkoopcyclus: 2, uitvoering_kpi_conversieratio: 2, uitvoering_kpi_klantaandeel: 2,
    uitvoering_kpi_klantretentie: 2, uitvoering_kpi_forecast: 2, uitvoering_kpi_ordergrootte: 2,
    uitvoering_kpi_nieuwe_logos: 2, uitvoering_kpi_omzet: 2, uitvoering_kpi_winst: 2,
    uitvoering_kpi_referrals: 2,
    uitvoering_okr_wie_1: 1, uitvoering_okr_wie_2: 1, uitvoering_okr_wie_3: 1,
    uitvoering_numbers_leads: 1, uitvoering_numbers_bezoeken: 1, uitvoering_numbers_offertes: 1,
    uitvoering_numbers_orders: 1, uitvoering_numbers_referrals: 1,
    uitvoering_conversie_leads_bezoeken: 1, uitvoering_conversie_bezoeken_offertes: 1,
    uitvoering_conversie_offertes_orders: 1,
    uitvoering_kwartaal_jaar: 1, uitvoering_feestje: 1, uitvoering_beloning: 1,
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
      const { data: answerRows } = await supabase
        .from('canvas_answers')
        .select('question_id, answer, score')
        .eq('user_id', user.id)

      const answers = answerRows || []

      const allFields = Object.entries(TOTAL_FIELDS).flatMap(([prefix, ids]) =>
        ids.map(id => `${prefix}_${id}`)
      )
      const filled = answers.filter(r => allFields.includes(r.question_id) && r.answer?.trim()).length
      const healthScore = Math.round((filled / allFields.length) * 100)

      const scored = answers.filter(r => r.score !== null && r.score !== undefined)
      const kwaliteitsScore = scored.length > 0 ? berekenKwaliteitsScore(scored) : null
      const laatsteAnalyse = scored.length > 0 ? new Date() : null

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

  if (!ready) {
    return (
      <button onClick={prepare} disabled={loading} style={btnStyle}>
        {loading ? 'LADEN...' : '↓ EXPORT PDF'}
      </button>
    )
  }

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