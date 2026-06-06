'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import BotNav from '../BotNav'
import { useIsMobile } from '@/hooks/useBreakpoint'

interface Session {
  id: string
  session_id: string
  title: string
  summary: string
  message_count: number
  created_at: string
  blog_suggestions?: { title: string; url: string }[]
}

interface ConvMessage {
  role: 'user' | 'arno'
  content: string
}

interface SavedAnalyse {
  id: string
  created_at: string
  analyse_text: string
  session_count: number
}

function renderContent(text: string) {
  return text
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

type Sort = 'newest' | 'oldest' | 'most' | 'least'

export default function GeschiedenisPage() {
  const isMobile = useIsMobile()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<Sort>('newest')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [convMessages, setConvMessages] = useState<ConvMessage[]>([])
  const [convLoading, setConvLoading] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [analyseLoading, setAnalyseLoading] = useState(false)
  const [activeAnalyse, setActiveAnalyse] = useState<string | null>(null)
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalyse[]>([])
  const [expandedAnalyse, setExpandedAnalyse] = useState<string | null>(null)
  const [showAllSessions, setShowAllSessions] = useState(false)
  const [isDuplicateAnalyse, setIsDuplicateAnalyse] = useState(false)
  const analysesSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/bot/sessions')
      .then(r => r.json())
      .then(data => setSessions(data.sessions ?? []))
      .finally(() => setLoading(false))
    fetch('/api/bot/coaching-analyses')
      .then(r => r.json())
      .then(data => setSavedAnalyses(data.analyses ?? []))
      .catch(() => {})
  }, [])

  const filtered = sessions.filter(s =>
    !search ||
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.summary?.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    if (sort === 'most') return b.message_count - a.message_count
    if (sort === 'least') return a.message_count - b.message_count
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  function toggleSelect(sessionId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(sessionId)) next.delete(sessionId)
      else next.add(sessionId)
      return next
    })
  }

  async function deleteSelected() {
    if (selected.size === 0 || deleting) return
    setDeleting(true)
    try {
      await Promise.all([...selected].map(id =>
        fetch(`/api/bot/session?sessionId=${id}`, { method: 'DELETE' })
      ))
      setSessions(prev => prev.filter(s => !selected.has(s.session_id)))
      if (expanded && selected.has(expanded)) {
        setExpanded(null)
        setConvMessages([])
      }
      setSelected(new Set())
    } catch {}
    setDeleting(false)
  }

  function getAnalyseTitle(text: string): string {
    const clean = text.replace(/\n/g, ' ').trim()
    if (clean.length <= 80) return clean
    const cut = clean.slice(0, 77)
    const lastSpace = cut.lastIndexOf(' ')
    return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut) + '...'
  }

  async function toggleSession(sessionId: string) {
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

  async function runAnalyse(sessionIds?: string[]) {
    setAnalyseLoading(true)
    setActiveAnalyse(null)
    setIsDuplicateAnalyse(false)
    try {
      const body = sessionIds ? { sessionIds } : {}
      const res = await fetch('/api/bot/coaching-analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.duplicate) {
        setIsDuplicateAnalyse(true)
        setActiveAnalyse(data.analyse)
      } else if (data.analyse) {
        setActiveAnalyse(data.analyse)
        if (data.id) {
          setSavedAnalyses(prev => [{
            id: data.id,
            created_at: data.created_at,
            analyse_text: data.analyse,
            session_count: data.count,
          }, ...prev])
        }
      }
    } catch {}
    setAnalyseLoading(false)
    setSelected(new Set())
    setTimeout(() => analysesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
  }

  const hasSelected = selected.size > 0
  const visibleSessions = search ? sorted : sorted.slice(0, showAllSessions ? sorted.length : 5)
  const hasMore = !search && !showAllSessions && sorted.length > 5

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #f0ede6; font-family: 'Space Mono', monospace; }
        @keyframes fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideup { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }

        .sort-btn {
          background: #111; border: none; color: rgb(136,136,136);
          font-family: 'Bebas Neue', sans-serif;
          font-size: 15px; letter-spacing: 3px;
          padding: 9px 20px; cursor: pointer; transition: all 0.15s;
          border-radius: 999px;
        }
        .sort-btn:hover { color: #f0ede6; }
        .sort-btn.active { background: #1a1a1a; color: #EE7700; }

        .delete-bar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
          background: #0a0a0a; border-top: 2px solid #EE7700;
          padding: 20px 40px;
          display: flex; align-items: center; justify-content: center; gap: 24px;
          animation: slideup 0.2s ease; flex-wrap: wrap;
        }
        .delete-bar-count {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 3px; color: #EE7700;
        }
        .delete-bar-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; justify-content: center; }
        .delete-bar-cancel {
          background: none; border: 1px solid #EE7700; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px; letter-spacing: 3px; color: rgb(136,136,136);
          transition: all 0.15s; padding: 11px 0;
          width: 180px; text-align: center; border-radius: 999px;
        }
        .delete-bar-cancel:hover { border-color: #EE7700; color: #EE7700; }
        .delete-bar-btn {
          background: #EE7700; border: 1px solid #EE7700; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px; letter-spacing: 3px; color: #0a0a0a;
          padding: 11px 0; transition: background 0.15s;
          width: 180px; text-align: center; border-radius: 999px;
        }
        .delete-bar-btn:hover { background: #ff8800; border-color: #ff8800; }
        .delete-bar-btn:disabled { background: #333; border-color: #333; color: #555; cursor: not-allowed; }
        .delete-bar-outline {
          background: none; border: 1px solid #EE7700; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px; letter-spacing: 3px; color: #EE7700;
          padding: 11px 0; transition: all 0.15s;
          width: 180px; text-align: center; border-radius: 999px;
        }
        .delete-bar-outline:hover { background: #EE7700; color: #0a0a0a; }
        .delete-bar-outline:disabled { border-color: #333; color: #444; cursor: not-allowed; }

        .session-checkbox {
          flex-shrink: 0; width: 22px; height: 22px;
          border: 2px solid #333; background: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 14px;
          transition: all 0.12s; color: transparent;
        }
        .session-checkbox:hover { border-color: #666; }
        .session-checkbox.checked { border-color: #EE7700; background: #EE7700; color: #0a0a0a; }

        .analyse-item {
          border-top: 1px solid #1a1a1a; padding: 20px 0;
          animation: fadein 0.3s ease;
        }
        .analyse-item-header {
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; gap: 16px;
        }
        .analyse-item-meta {
          font-family: 'Bebas Neue', sans-serif; font-size: 14px;
          letter-spacing: 2px; color: rgb(136,136,136);
        }
        .analyse-item-full {
          color: #d0cdc6; font-size: 16px; line-height: 1.9;
          margin-top: 12px; white-space: pre-wrap;
        }

        @media (max-width: 768px) {
          .delete-bar { padding: 16px 20px; gap: 12px; }
          .delete-bar-cancel, .delete-bar-btn, .delete-bar-outline { width: 140px; font-size: 14px; padding: 10px 0; }
        }
      `}</style>

      <BotNav active="bieb" />

      <div style={{ maxWidth: 812, margin: '0 auto', padding: `clamp(80px,12vw,120px) clamp(16px,4vw,20px) ${hasSelected ? 100 : 80}px` }}>

        <p style={{ color: '#EE7700', fontSize: 13, letterSpacing: 4, marginBottom: 8 }}>ARNOBOT</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, lineHeight: 1, marginBottom: 48 }}>GESPREKKEN</h1>

        {/* Zoekbalk + sortering */}
        <div style={{ marginBottom: 40, borderBottom: '1px solid #1a1a1a', paddingBottom: 40 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoek in gesprekken..."
            style={{
              width: '100%', background: '#111', border: '1px solid #2a2a2a',
              color: '#f0ede6', fontFamily: "'Space Mono', monospace",
              fontSize: 14, padding: '12px 16px', outline: 'none', letterSpacing: 1,
              marginBottom: 16,
            }}
            onFocus={e => (e.target.style.borderColor = '#EE7700')}
            onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
            {sorted.length > 0 && (
              <button
                className={`sort-btn${selected.size === sorted.length ? ' active' : ''}`}
                style={{ borderRadius: 8 }}
                onClick={() => {
                  if (selected.size === sorted.length) setSelected(new Set())
                  else setSelected(new Set(sorted.map(s => s.session_id)))
                }}
              >
                {selected.size === sorted.length ? 'DESELECTEER ALLES' : 'SELECTEER ALLES'}
              </button>
            )}
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className={`sort-btn${sort === 'newest' || sort === 'oldest' ? ' active' : ''}`}
                style={{ borderRadius: 8, minWidth: 110 }}
                onClick={() => setSort(sort === 'newest' ? 'oldest' : 'newest')}
              >
                DATUM {sort === 'oldest' ? '↑' : '↓'}
              </button>
              <button
                className={`sort-btn${sort === 'most' || sort === 'least' ? ' active' : ''}`}
                style={{ borderRadius: 8, minWidth: 110 }}
                onClick={() => setSort(sort === 'most' ? 'least' : 'most')}
              >
                VRAGEN {sort === 'least' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {!loading && sorted.length > 0 && (
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, fontWeight: 400, color: 'rgb(136,136,136)', marginBottom: 8, border: '1px solid #2a2a2a', borderLeft: '3px solid #EE7700', padding: '10px 16px', display: 'inline-block' }}>
            Selecteer minimaal 3 gesprekken voor een analyse.
          </p>
        )}

        {loading && (
          <p style={{ color: 'rgb(136,136,136)', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase' }}>Laden...</p>
        )}

        {!loading && sorted.length === 0 && (
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
        {visibleSessions.map(session => {
          const isSelected = selected.has(session.session_id)
          const isOpen = expanded === session.session_id
          return (
            <div key={session.session_id} style={{ borderTop: '1px solid #1a1a1a', animation: 'fadein 0.3s ease' }}>

              {isMobile ? (
                /* Mobile card layout */
                <div style={{ padding: '20px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <button
                      className={`session-checkbox${isSelected ? ' checked' : ''}`}
                      onClick={() => toggleSelect(session.session_id)}
                      title={isSelected ? 'Deselecteer' : 'Selecteer'}
                    >
                      {isSelected ? '✓' : ''}
                    </button>
                    <span style={{ color: '#888', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'Space Mono', monospace", flex: 1 }}>
                      {formatDateShort(session.created_at)}
                    </span>
                    <span style={{ color: '#555', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'Space Mono', monospace", whiteSpace: 'nowrap' }}>
                      {session.message_count} {session.message_count === 1 ? 'vraag' : 'vragen'}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleSession(session.session_id)}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                  >
                    <p style={{ color: '#f0ede6', fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, lineHeight: 1.4, marginBottom: session.summary ? 6 : 0 }}>
                      {session.title}
                    </p>
                    {session.summary && (
                      <p style={{ color: '#666', fontSize: 13, lineHeight: 1.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {session.summary}
                      </p>
                    )}
                    <span style={{ color: isOpen ? '#EE7700' : '#555', fontSize: 13, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, display: 'block', marginTop: 8 }}>
                      {isOpen ? '↑ SLUITEN' : '↓ OPEN'}
                    </span>
                  </button>
                </div>
              ) : (
                /* Desktop card layout */
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '28px 0' }}>
                  <button
                    className={`session-checkbox${isSelected ? ' checked' : ''}`}
                    onClick={() => toggleSelect(session.session_id)}
                    title={isSelected ? 'Deselecteer' : 'Selecteer'}
                  >
                    {isSelected ? '✓' : ''}
                  </button>
                  <button
                    onClick={() => toggleSession(session.session_id)}
                    style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 24, textAlign: 'left', padding: 0 }}
                  >
                    <span style={{ color: '#888', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: 120, fontFamily: "'Space Mono', monospace" }}>
                      {formatDate(session.created_at)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#f0ede6', fontSize: 20, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, lineHeight: 1.4, marginBottom: session.summary ? 6 : 0 }}>
                        {session.title}
                      </p>
                      {session.summary && (
                        <p style={{ color: '#666', fontSize: 13, lineHeight: 1.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {session.summary}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <span style={{ color: '#888', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap', fontFamily: "'Space Mono', monospace" }}>
                        {session.message_count} {session.message_count === 1 ? 'vraag' : 'vragen'}
                      </span>
                      <span style={{ color: isOpen ? '#EE7700' : '#888', fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>
                        {isOpen ? '↑ SLUITEN' : '↓ OPEN'}
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {isOpen && (
                <div style={{ paddingBottom: 40, animation: 'fadein 0.3s ease' }}>
                  {session.summary && (
                    <div style={{ background: '#0f0f0f', borderLeft: '3px solid #EE7700', padding: '20px 24px', marginBottom: 32 }}>
                      <p style={{ color: '#EE7700', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>SYNTHESE</p>
                      <p style={{ color: '#d0cdc6', fontSize: 16, fontFamily: "'Space Mono', monospace", lineHeight: 1.9, marginBottom: session.blog_suggestions?.length ? 24 : 0 }}>{session.summary}</p>
                      {session.blog_suggestions && session.blog_suggestions.length > 0 && (
                        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 20 }}>
                          <p style={{ color: 'rgb(136,136,136)', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12, fontFamily: "'Bebas Neue', sans-serif" }}>VERDER LEZEN</p>
                          {session.blog_suggestions.map((b, i) => (
                            <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" style={{
                              display: 'block', color: '#888', textDecoration: 'none',
                              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1.5,
                              lineHeight: 1, padding: '10px 16px', marginBottom: 2,
                              borderLeft: '3px solid #1a1a1a', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#f0ede6'; (e.currentTarget as HTMLAnchorElement).style.borderLeftColor = '#EE7700'; (e.currentTarget as HTMLAnchorElement).style.background = '#111' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#888'; (e.currentTarget as HTMLAnchorElement).style.borderLeftColor = '#1a1a1a'; (e.currentTarget as HTMLAnchorElement).style.background = 'none' }}
                            >
                              {b.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {convLoading && (
                    <p style={{ color: '#333', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', padding: '16px 0' }}>Gesprek laden...</p>
                  )}
                  {convMessages.map((msg, i) => (
                    <div key={i} style={{ padding: '20px 0', borderTop: '1px solid #111', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 4 : 32, alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 3, color: msg.role === 'user' ? 'rgb(136,136,136)' : '#EE7700', whiteSpace: 'nowrap', paddingTop: isMobile ? 0 : 3, minWidth: isMobile ? 0 : 60 }}>
                        {msg.role === 'user' ? 'JIJ' : 'ARNO'}
                      </span>
                      <span
                        style={{ fontSize: msg.role === 'user' ? 16 : 14, lineHeight: msg.role === 'user' ? 1.6 : 1.9, color: msg.role === 'user' ? '#f0ede6' : '#888', fontFamily: "'Space Mono', monospace", fontWeight: 400, letterSpacing: 0, whiteSpace: 'pre-wrap' }}
                        dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                      />
                    </div>
                  ))}

                  <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #111' }}>
                    <Link
                      href={`/bot?resume=${session.session_id}`}
                      style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: 'rgb(136,136,136)', textDecoration: 'none' }}
                      onMouseOver={e => (e.currentTarget.style.color = '#EE7700')}
                      onMouseOut={e => (e.currentTarget.style.color = 'rgb(136,136,136)')}
                    >
                      ← Vervolg dit gesprek met ArnoBot.
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Toon meer / minder sessies */}
        {!search && sorted.length > 5 && (
          <div style={{ borderTop: '1px solid #1a1a1a', padding: '28px 0', textAlign: 'center' }}>
            <button
              onClick={() => setShowAllSessions(v => !v)}
              style={{ background: 'none', border: '1px solid #333', cursor: 'pointer', fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 3, color: 'rgb(136,136,136)', padding: '11px 32px', borderRadius: 999, transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#EE7700'; (e.currentTarget as HTMLButtonElement).style.color = '#EE7700' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#333'; (e.currentTarget as HTMLButtonElement).style.color = 'rgb(136,136,136)' }}
            >
              {showAllSessions ? `TOON MINDER ↑` : `TOON ALLE ${sorted.length} GESPREKKEN ↓`}
            </button>
          </div>
        )}

        {/* Analyses sectie */}
        {(activeAnalyse || savedAnalyses.length > 0) && (
          <div ref={analysesSectionRef} style={{ borderTop: '1px solid #1a1a1a', paddingTop: 40, marginTop: 16 }}>
            <p style={{ color: '#EE7700', fontSize: 13, letterSpacing: 4, marginBottom: 8 }}>ARNOBOT</p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, lineHeight: 1, marginBottom: 48 }}>ANALYSES</h2>

            {activeAnalyse && !isDuplicateAnalyse && (
              <div style={{ marginBottom: 28, background: '#0f0f0f', borderLeft: '3px solid #EE7700', padding: '20px 24px' }}>
                <p style={{ color: '#EE7700', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>NIEUW GEGENEREERD</p>
                <p style={{ color: '#d0cdc6', fontSize: 16, lineHeight: 1.9, fontFamily: "'Space Mono', monospace", whiteSpace: 'pre-wrap', marginBottom: 16 }}>{activeAnalyse}</p>
                <button
                  onClick={() => setActiveAnalyse(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 3, color: 'rgb(136,136,136)', padding: 0 }}
                >
                  × VERBERG
                </button>
              </div>
            )}
            {isDuplicateAnalyse && (
              <p style={{ color: '#555', fontSize: 12, letterSpacing: 2, fontFamily: "'Space Mono', monospace", marginBottom: 28 }}>
                Deze combinatie is al eerder geanalyseerd — zie hieronder.
              </p>
            )}

            {savedAnalyses.map(a => (
              <div key={a.id} style={{ borderTop: '1px solid #1a1a1a', animation: 'fadein 0.3s ease' }}>
                <button
                  onClick={() => setExpandedAnalyse(expandedAnalyse === a.id ? null : a.id)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 24, textAlign: 'left', padding: '28px 0' }}
                >
                  <span style={{ color: '#888', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: isMobile ? 0 : 120, fontFamily: "'Space Mono', monospace" }}>
                    {isMobile ? formatDateShort(a.created_at) : formatDate(a.created_at)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#f0ede6', fontSize: 20, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, lineHeight: 1.4 }}>
                      {getAnalyseTitle(a.analyse_text)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={{ color: '#888', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap', fontFamily: "'Space Mono', monospace" }}>
                      {a.session_count} {a.session_count === 1 ? 'GESPREK' : 'GESPREKKEN'}
                    </span>
                    <span style={{ color: expandedAnalyse === a.id ? '#EE7700' : '#888', fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>
                      {expandedAnalyse === a.id ? '↑ SLUITEN' : '↓ OPEN'}
                    </span>
                  </div>
                </button>
                {expandedAnalyse === a.id && (
                  <div style={{ paddingBottom: 40, animation: 'fadein 0.3s ease' }}>
                    <p className="analyse-item-full">{a.analyse_text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {sorted.length > 0 && (
          <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 40, marginTop: 40 }}>
            <Link href="/bot" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#EE7700', textDecoration: 'none' }}>
              ← TERUG NAAR DE BOT
            </Link>
          </div>
        )}
      </div>

      {/* Sticky balk */}
      {hasSelected && (
        <div className="delete-bar">
          <span className="delete-bar-count">
            {selected.size} {selected.size === 1 ? 'GESPREK' : 'GESPREKKEN'} GESELECTEERD
          </span>
          <div className="delete-bar-actions">
            <button className="delete-bar-cancel" onClick={() => setSelected(new Set())}>
              ANNULEER
            </button>
            {selected.size >= 3 && (
              <button
                className="delete-bar-outline"
                onClick={() => runAnalyse([...selected])}
                disabled={analyseLoading}
              >
                {analyseLoading ? 'ANALYSEREN...' : 'ANALYSEER →'}
              </button>
            )}
            <button className="delete-bar-btn" onClick={deleteSelected} disabled={deleting}>
              {deleting ? 'VERWIJDEREN...' : 'VERWIJDER →'}
            </button>
          </div>
        </div>
      )}

    </>
  )
}
