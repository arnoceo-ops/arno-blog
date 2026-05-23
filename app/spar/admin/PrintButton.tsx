'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{ background: '#222', color: '#f0ede6', border: '1px solid #333', padding: '10px 20px', cursor: 'pointer', fontSize: '14px' }}
    >
      Print / PDF
    </button>
  )
}
