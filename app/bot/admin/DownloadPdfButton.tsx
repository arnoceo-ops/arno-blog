'use client'

import { useState } from 'react'

type LogRow = {
  id: string
  created_at: string
  question: string
  answer: string
  ip: string
  session_id: string
}

export default function DownloadPdfButton({
  sessions,
  dateRange,
}: {
  sessions: [string, LogRow[]][]
  dateRange: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { ArnoBotPdfDocument } = await import('./ArnoBotPdfDocument')
      const blob = await pdf(<ArnoBotPdfDocument sessions={sessions} dateRange={dateRange} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `arnobot-gesprekken-${dateRange}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('PDF error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{ background: loading ? '#374151' : '#f59e0b', color: '#000', border: 'none', padding: '10px 20px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', letterSpacing: '1px' }}
    >
      {loading ? 'GENEREREN...' : '↓ DOWNLOAD PDF'}
    </button>
  )
}
