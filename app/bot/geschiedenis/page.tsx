'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Session {
  id: string
  session_id: string
  title: string
  summary: string
  message_count: number
  created_at: string
}

interface ConvMessage {
  role: 'user' | 'arno'
  content: string
}

function renderContent(text: string) {
  return text
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function GeschiedenisPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [convMessages, setConvMessages] = useState<ConvMessage[]>([])
  const [convLoading, setConvLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [analyse, setAnalyse] = useState<string | null>(null)
  const [analyseLoading, setAnalyseLoading] = useState(false)

  useEffect(() => {
    fetch('/api/bot/sessions')
      .then(r => r.json())
      .then(data => setSessions(data.sessions ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = sessions.filter(s =>
    !search ||
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.summary?.toLowerCase().includes(search.toLowerCase())
  )

  async function deleteSession(sessionId: string) {
    if (deleteConfirmId !== sessionId) {
      setDeleteConfirmId(sessionId)
      return
    }
    setDeletingId(sessionId)
    setDeleteConfirmId(null)
    try {
      await fetch(`/api/bot/session?sessionId=${sessionId}`, { method: 'DELETE' })
      setSessions(prev => prev.filter(s => s.session_id !== sessionId))
      if (expanded === sessionId) {
        setExpanded(null)
        setConvMessages([])
      }
    } catch {}
    setDeletingId(null)
  }

  async function toggleSession(sessionId: string) {
    setDeleteConfirmId(null)
    if (expanded === sessionId) {
      setExpanded(null)
      setConvMessages([])
      return
    }
    setExpanded(sessionId)
    setConvLoading(true)
    setConvMessages([])
    try {
      const res = await fetch(`/api/bot/session?sessionId=${sessionId}`)
      const data = await res.json()
      setConvMessages(data.messages ?? [])
    } catch {}
    setConvLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #f0ede6; font-family: 'Space Mono', monospace; }
        @keyframes fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 40px', display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3 }}>HOME</Link>
          <Link href="/bot" style={{ color: '#888', textDecoration: 'none', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3 }}>BOT</Link>
          <span style={{ color: '#EE7700', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3 }}>ARCHIEF</span>
          <Link href="/bot/account" style={{ color: '#888', textDecoration: 'none', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3 }}>ACCOUNT</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 812, margin: '0 auto', padding: '120px 20px 80px' }}>

        <p style={{ color: '#EE7700', fontSize: 13, letterSpacing: 4, marginBottom: 8 }}>ARNOBOT</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, lineHeight: 1, marginBottom: 40 }}>GESPREKKEN</h1>

        {sessions.length >= 5 && (
          <div style={{ marginBottom: 48, borderBottom: '1px solid #1a1a1a', paddingBottom: 48 }}>
            {!analyse ? (
              <button
                onClick={async () => {
                  setAnalyseLoading(true)
                  try {
                    const res = await fetch('/api/bot/coaching-analyse', { method: 'POST' })
                    const data = await res.json()
                    if (data.analyse) setAnalyse(data.analyse)
                  } catch {}
                  setAnalyseLoading(false)
                }}
                disabled={analyseLoading}
                style={{
                  background: 'none', border: '1px solid #EE7700', cursor: 'pointer',
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3,
                  color: '#EE7700', padding: '12px 28px', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EE7700'; (e.currentTarget as HTMLButtonElement).style.color = '#141414' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#EE7700' }}
              >
                {analyseLoading ? 'ANALYSEREN...' : `ANALYSEER MIJN ${sessions.length} GESPREKKEN →`}
              </button>
            ) : (
              <div>
                <p style={{ color: '#EE7700', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16 }}>PATROONANALYSE</p>
                <p style={{ color: '#d0cdc6', fontSize: 15, lineHeight: 1.9, fontFamily: "'Space Mono', monospace", whiteSpace: 'pre-wrap', marginBottom: 24 }}>{analyse}</p>
                <button
                  onClick={() => setAnalyse(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 3,
                    color: '#444',
                  }}
                >
                  × VERBERG
                </button>
              </div>
            )}
          </div>
        )}

        {/* Zoekbalk */}
        <div style={{ marginBottom: 40, borderBottom: '1px solid #1a1a1a', paddingBottom: 40 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoek in gesprekken..."
            style={{
              width: '100%', background: '#111', border: '1px solid #2a2a2a',
              color: '#f0ede6', fontFamily: "'Space Mono', monospace",
              fontSize: 14, padding: '12px 16px', outline: 'none',
              letterSpacing: 1,
            }}
            onFocus={e => (e.target.style.borderColor = '#EE7700')}
            onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
          />
        </div>

        {/* Laadindicator */}
        {loading && (
          <p style={{ color: '#333', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase' }}>Laden...</p>
        )}

        {/* Geen resultaten */}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <p style={{ color: '#333', fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
              {search ? 'Geen gesprekken gevonden' : 'Nog geen gesprekken'}
            </p>
            {!search && (
              <Link href="/bot" style={{ color: '#EE7700', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, textDecoration: 'none' }}>
                START EERSTE GESPREK →
              </Link>
            )}
          </div>
        )}

        {/* Sessie-lijst */}
        {filtered.map(session => (
          <div key={session.session_id} style={{ borderTop: '1px solid #1a1a1a', animation: 'fadein 0.3s ease' }}>

            {/* Klikbare header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <button
                onClick={() => toggleSession(session.session_id)}
                style={{
                  flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                  padding: '28px 0', display: 'flex', alignItems: 'flex-start',
                  gap: 24, textAlign: 'left',
                }}
              >
                <span style={{ color: '#333', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap', paddingTop: 4, minWidth: 120 }}>
                  {formatDate(session.created_at)}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#f0ede6', fontSize: 15, fontFamily: "'Space Mono', monospace", fontWeight: 700, lineHeight: 1.5, marginBottom: session.summary ? 8 : 0 }}>
                    {session.title}
                  </p>
                  {session.summary && (
                    <p style={{ color: '#555', fontSize: 13, lineHeight: 1.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {session.summary}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, paddingTop: 2 }}>
                  <span style={{ color: '#333', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {session.message_count} {session.message_count === 1 ? 'vraag' : 'vragen'}
                  </span>
                  <span style={{ color: expanded === session.session_id ? '#EE7700' : '#333', fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>
                    {expanded === session.session_id ? '↑ SLUITEN' : '↓ OPEN'}
                  </span>
                </div>
              </button>
              <button
                onClick={() => deleteSession(session.session_id)}
                disabled={deletingId === session.session_id}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '28px 0 28px 8px', alignSelf: 'flex-start',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 13, letterSpacing: 2,
                  color: deleteConfirmId === session.session_id ? '#ff4444' : '#2a2a2a',
                  whiteSpace: 'nowrap', transition: 'color 0.15s',
                }}
                onMouseEnter={e => { if (deleteConfirmId !== session.session_id) (e.currentTarget as HTMLButtonElement).style.color = '#555' }}
                onMouseLeave={e => { if (deleteConfirmId !== session.session_id) (e.currentTarget as HTMLButtonElement).style.color = '#2a2a2a' }}
              >
                {deletingId === session.session_id
                  ? '...'
                  : deleteConfirmId === session.session_id
                  ? 'BEVESTIG ×'
                  : '×'}
              </button>
            </div>

            {/* Uitgevouwen inhoud */}
            {expanded === session.session_id && (
              <div style={{ paddingBottom: 40, animation: 'fadein 0.3s ease' }}>

                {/* Synthese */}
                {session.summary && (
                  <div style={{ background: '#0f0f0f', borderLeft: '3px solid #EE7700', padding: '20px 24px', marginBottom: 32 }}>
                    <p style={{ color: '#EE7700', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>SYNTHESE</p>
                    <p style={{ color: '#888', fontSize: 14, lineHeight: 1.9 }}>{session.summary}</p>
                  </div>
                )}

                {/* Volledig gesprek */}
                {convLoading && (
                  <p style={{ color: '#333', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', padding: '16px 0' }}>Gesprek laden...</p>
                )}
                {convMessages.map((msg, i) => (
                  <div key={i} style={{
                    padding: '24px 0', borderTop: '1px solid #111',
                    display: 'flex', gap: 32, alignItems: 'flex-start',
                  }}>
                    <span style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, letterSpacing: 3,
                      color: msg.role === 'user' ? '#333' : '#EE7700',
                      whiteSpace: 'nowrap', paddingTop: 3, minWidth: 60,
                    }}>
                      {msg.role === 'user' ? 'JIJ' : 'ARNO'}
                    </span>
                    <span
                      style={{
                        fontSize: msg.role === 'user' ? 18 : 14,
                        lineHeight: msg.role === 'user' ? 1.5 : 1.9,
                        color: msg.role === 'user' ? '#f0ede6' : '#888',
                        fontFamily: msg.role === 'user' ? "'Bebas Neue', sans-serif" : "'Space Mono', monospace",
                        letterSpacing: msg.role === 'user' ? 0.5 : 0,
                        whiteSpace: 'pre-wrap',
                      }}
                      dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                    />
                  </div>
                ))}

                {/* Herhaal in bot */}
                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #111' }}>
                  <Link
                    href="/bot"
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 3,
                      color: '#444', textDecoration: 'none', transition: 'color 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.color = '#EE7700')}
                    onMouseOut={e => (e.currentTarget.style.color = '#444')}
                  >
                    ← VERDER PRATEN IN DE BOT
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Onderaan: terug-link */}
        {filtered.length > 0 && (
          <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 40, marginTop: 0 }}>
            <Link href="/bot" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#EE7700', textDecoration: 'none' }}>
              ← TERUG NAAR DE BOT
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
