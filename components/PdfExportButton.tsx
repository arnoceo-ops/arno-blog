'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import jsPDF from 'jspdf'

type Section = { label: string; answer: string }[]

type ExportData = {
  healthScore: number
  filled: number
  total: number
  exportedAt: string
  sections: {
    strategie: Section
    mensen: Section
    uitvoering: Section
  }
}

function addSection(
  doc: jsPDF,
  title: string,
  pages: string,
  fields: Section,
  startY: number
): number {
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = startY

  // Sectie header
  if (y > 240) { doc.addPage(); y = 20 }
  doc.setFontSize(8)
  doc.setTextColor(238, 119, 0)
  doc.text(pages, margin, y)
  y += 6

  doc.setFontSize(18)
  doc.setTextColor(240, 237, 230)
  doc.text(title, margin, y)
  y += 4

  // Lijn onder titel
  doc.setDrawColor(238, 119, 0)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // Velden
  for (const field of fields) {
    if (!field.answer?.trim()) continue

    if (y > 260) { doc.addPage(); y = 20 }

    // Label
    doc.setFontSize(7)
    doc.setTextColor(238, 119, 0)
    doc.text(field.label, margin, y)
    y += 5

    // Antwoord
    doc.setFontSize(10)
    doc.setTextColor(200, 197, 190)
    const lines = doc.splitTextToSize(field.answer, contentWidth)
    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.text(line, margin, y)
      y += 5
    }
    y += 4
  }

  return y + 10
}

export default function PdfExportButton() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (!user) return
    setLoading(true)

    try {
      const res = await fetch(`/api/pdf-data?user_id=${user.id}`)
      const data: ExportData = await res.json()

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20

      // Zwarte achtergrond cover pagina
      doc.setFillColor(10, 10, 10)
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')

      // Cover — RDS CANVAS
      doc.setFontSize(9)
      doc.setTextColor(238, 119, 0)
      doc.text('ROYAL DUTCH SALES', margin, 30)

      doc.setFontSize(42)
      doc.setTextColor(240, 237, 230)
      doc.text('RDS', margin, 55)
      doc.text('CANVAS', margin, 70)

      // Health score
      doc.setFontSize(10)
      doc.setTextColor(238, 119, 0)
      doc.text('PLAN HEALTH SCORE', margin, 95)

      doc.setFontSize(36)
      doc.setTextColor(240, 237, 230)
      doc.text(`${data.healthScore}%`, margin, 115)

      // Progress bar
      doc.setFillColor(30, 30, 30)
      doc.rect(margin, 120, pageWidth - margin * 2, 1, 'F')
      doc.setFillColor(238, 119, 0)
      doc.rect(margin, 120, (pageWidth - margin * 2) * (data.healthScore / 100), 1, 'F')

      // Stats
      doc.setFontSize(8)
      doc.setTextColor(150, 147, 140)
      doc.text(`${data.filled} / ${data.total} velden ingevuld`, margin, 128)

      // Datum
      const date = new Date(data.exportedAt).toLocaleDateString('nl-NL', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
      doc.text(`Geëxporteerd op ${date}`, margin, 134)

      // Segmentsamenvatting
      doc.setFontSize(7)
      doc.setTextColor(238, 119, 0)
      const segs = [
        { label: 'STRATEGIE', filled: data.sections.strategie.filter(f => f.answer?.trim()).length, total: data.sections.strategie.length },
        { label: 'MENSEN', filled: data.sections.mensen.filter(f => f.answer?.trim()).length, total: data.sections.mensen.length },
        { label: 'UITVOERING', filled: data.sections.uitvoering.filter(f => f.answer?.trim()).length, total: data.sections.uitvoering.length },
      ]
      let sx = margin
      for (const seg of segs) {
        doc.text(seg.label, sx, 148)
        doc.setTextColor(150, 147, 140)
        doc.setFontSize(9)
        doc.text(`${seg.filled}/${seg.total}`, sx, 154)
        doc.setTextColor(238, 119, 0)
        doc.setFontSize(7)
        sx += 55
      }

      // Nieuwe pagina voor inhoud — witte achtergrond
      doc.addPage()
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')

      let y = 20

      y = addSection(doc, 'STRATEGIE', '01 — 02', data.sections.strategie, y)
      y = addSection(doc, 'MENSEN', '03 — 04', data.sections.mensen, y)
      y = addSection(doc, 'UITVOERING', '05 — 06', data.sections.uitvoering, y)

      doc.save(`RDS-Canvas-${date}.pdf`)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      style={{
        backgroundColor: 'transparent',
        border: '1px solid #333',
        color: loading ? '#555' : '#f0ede6',
        padding: '10px 24px',
        fontSize: '11px',
        letterSpacing: '2px',
        cursor: loading ? 'default' : 'pointer',
        fontFamily: 'var(--font-geist-sans), sans-serif',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.borderColor = '#EE7700' }}
      onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = '#333' }}
    >
      {loading ? 'EXPORTEREN...' : '↓ PDF EXPORTEREN'}
    </button>
  )
}
