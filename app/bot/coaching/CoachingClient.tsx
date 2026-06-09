'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BotNav from '../BotNav'

interface CoachingDoc {
  focus: string
  blinde_vlekken: string
  ontwikkelpunten: string[]
  voortgang: string
  opdracht: string
  blogs: { title: string; url: string }[]
  conversation_count: number
  updated_at?: string
}

interface Stats {
  sessionCount: number
  totalQuestions: number
  lastSessionDate: string | null
}

interface SavedAnalyse {
  id: string
  created_at: string
  analyse_text: string
  session_count: number
}

interface Props {
  userId: string
}

function getAnalyseTitle(text: string): string {
  const clean = text.replace(/\n/g, ' ').trim()
  if (clean.length <= 80) return clean
  const cut = clean.slice(0, 77)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut) + '...'
}

export default function CoachingClient({ userId }: Props) {
  const [doc, setDoc] = useState<CoachingDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [analyses, setAnalyses] = useState<SavedAnalyse[]>([])
  const [uitdaging, setUitdaging] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/bot/coaching')
      .then(r => r.json())
      .then(data => setDoc(data.coaching))
      .finally(() => setLoading(false))
    fetch('/api/bot/sessions')
      .then(r => r.json())
      .then(data => {
        const sessions = data.sessions ?? []
        setStats({
          sessionCount: sessions.length,
          totalQuestions: sessions.reduce((sum: number, s: { message_count?: number }) => sum + (s.message_count || 0), 0),
          lastSessionDate: sessions[0]?.created_at ?? null,
        })
      })
      .catch(() => {})
    fetch('/api/bot/coaching-analyses')
      .then(r => r.json())
      .then(data => setAnalyses(data.analyses ?? []))
      .catch(() => {})

    // Dagelijkse uitdaging — max 1x per 24 uur
    const today = new Date().toISOString().slice(0, 10)
    const cacheKey = `arnobot_uitdaging_${today}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      setUitdaging(cached)
    } else {
      fetch('/api/bot/uitdaging')
        .then(r => r.json())
        .then(data => {
          if (data.uitdaging) {
            localStorage.setItem(cacheKey, data.uitdaging)
            setUitdaging(data.uitdaging)
          }
        })
        .catch(() => {})
    }
  }, [])

  async function generate() {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/bot/coaching', { method: 'POST' })
      const data = await res.json()
      if (data.error === 'te_weinig') {
        setError(`Je hebt ${data.count} gesprekken. Minimaal 5 nodig.`)
      } else if (data.coaching) {
        setDoc({ ...data.coaching, updated_at: new Date().toISOString() })
      }
    } catch {
      setError('Er ging iets mis. Probeer opnieuw.')
    }
    setGenerating(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111827; color: #f1f5f9; font-family: 'Space Mono', monospace; font-weight: 400; }
        @keyframes fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }

        .coaching-section {
          padding: 48px 0;
          border-top: 1px solid #374151;
          animation: fadein 0.4s ease;
        }
        .coaching-label {
          font-family: 'Space Mono', monospace;
          font-size: 13px; font-weight: 700; letter-spacing: 4px; color: #f59e0b;
          text-transform: uppercase; display: block; margin-bottom: 16px;
        }
        .coaching-body {
          color: #f1f5f9; font-size: 15px; line-height: 1.9; font-weight: 400;
          font-family: 'Space Mono', monospace; white-space: pre-wrap;
        }
        .ontwikkelpunt {
          display: flex; gap: 20px; align-items: flex-start;
          padding: 20px 0; border-bottom: 1px solid #374151;
        }
        .ontwikkelpunt:last-child { border-bottom: none; }
        .ontwikkelpunt-nr {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px; color: #f59e0b; line-height: 1;
          min-width: 32px; padding-top: 2px;
        }
        .ontwikkelpunt-text {
          font-size: 15px; line-height: 1.9; color: #f1f5f9;
          font-family: 'Space Mono', monospace; font-weight: 400;
        }
        .opdracht-box {
          background: #1f2937; border-left: 3px solid #f59e0b;
          padding: 24px 28px; margin-top: 0;
        }
        .opdracht-label {
          font-family: 'Space Mono', monospace;
          font-size: 13px; font-weight: 700; letter-spacing: 4px; color: #f59e0b;
          display: block; margin-bottom: 12px;
        }
        .opdracht-text {
          color: #9ca3af; font-size: 15px; line-height: 1.9;
          font-family: 'Space Mono', monospace; font-weight: 400;
        }
        .blog-item {
          display: block; color: #9ca3af; text-decoration: none;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 1.5px; line-height: 1;
          padding: 14px 20px; border-left: 3px solid #374151;
          margin-bottom: 2px; transition: all 0.15s;
        }
        .blog-item:hover { color: #f1f5f9; border-left-color: #f59e0b; background: #1f2937; }
        .generate-btn {
          background: #f59e0b; border: none; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 3px;
          color: #111827; padding: 12px 36px; transition: all 0.2s;
          border-radius: 999px; min-width: 220px;
        }
        .generate-btn:hover:not(:disabled) { background: #d97706; }
        .generate-btn:disabled { background: #374151; color: #6b7280; cursor: not-allowed; }
        .pdf-btn {
          background: none; border: 1px solid #374151; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 3px;
          color: #9ca3af; padding: 12px 32px; transition: all 0.2s;
          border-radius: 999px; min-width: 220px;
        }
        .pdf-btn:hover { border-color: #6b7280; color: #f1f5f9; }
        .stat-block { text-align: center; }
        .stat-number { font-family: 'Bebas Neue', sans-serif; font-size: 56px; color: #f59e0b; line-height: 1; }
        .stat-label { font-family: 'Bebas Neue', sans-serif; font-size: 13px; letter-spacing: 4px; color: #9ca3af; margin-top: 4px; }
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .no-print { display: none !important; }
          .coaching-label { color: #f59e0b !important; }
          .coaching-body { color: #374151 !important; }
          .ontwikkelpunt-text { color: #000 !important; }
          .opdracht-box { background: #f5f5f5 !important; border-left: 3px solid #f59e0b !important; }
          .opdracht-text { color: #000 !important; }
          .blog-item { color: #374151 !important; border-left-color: #f59e0b !important; }
          .coaching-section { border-top-color: #ddd !important; }
        }
        .loading-dot {
          width: 8px; height: 8px; background: #f59e0b; border-radius: 50%;
          animation: pulse 1.2s ease-in-out infinite; display: inline-block; margin: 0 3px;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <BotNav active="coaching" />

      {uitdaging && (
        <div className="no-print" style={{ borderBottom: '2px solid #f59e0b', background: '#111827', padding: 'clamp(96px,12vw,120px) clamp(20px,6vw,60px) clamp(48px,6vw,64px)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, letterSpacing: 4, color: '#f59e0b', display: 'block', marginBottom: 24 }}>UITDAGING VAN VANDAAG</span>
            <div style={{ background: '#1f2937', border: '1px solid #374151', padding: '28px 32px' }}>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, lineHeight: 2, color: '#9ca3af' }}>{uitdaging}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 812, margin: '0 auto', padding: 'clamp(80px,12vw,120px) clamp(16px,4vw,20px) 80px' }}>

        <p style={{ color: '#f59e0b', fontSize: 13, letterSpacing: 4, marginBottom: 8 }}>ARNOBOT</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, lineHeight: 1, marginBottom: 16 }}>COACHING</h1>

        {/* Header met knoppen */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid #374151', flexWrap: 'wrap', gap: 20 }}>
          <div>
            {!doc && !loading && (
              <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.8, maxWidth: 480 }}>
                Op basis van je gesprekken maakt Arno een persoonlijk coachingsdocument. Wat je focust, wat je vermijdt, en wat je concreet moet aanpakken.
              </p>
            )}
            {error && <p style={{ color: '#ff6644', fontSize: 13, letterSpacing: 1, marginTop: 8 }}>{error}</p>}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="generate-btn no-print" onClick={generate} disabled={generating || loading}>
                {generating ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span className="loading-dot" />
                    <span className="loading-dot" />
                    <span className="loading-dot" />
                    <span>ARNO GENEREERT</span>
                  </span>
                ) : doc ? 'ADVISEER →' : 'GENEREER COACHING →'}
              </button>
              {(() => {
                if (!doc?.updated_at) return null
                const docDate = new Date(doc.updated_at)
                const lastSession = stats?.lastSessionDate ? new Date(stats.lastSessionDate) : null
                const lastAnalyse = analyses[0]?.created_at ? new Date(analyses[0].created_at) : null
                const isUpToDate = (!lastSession || docDate >= lastSession) && (!lastAnalyse || docDate >= lastAnalyse)
                if (!isUpToDate) return null
                return (
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#9ca3af', letterSpacing: 1, textAlign: 'center' }}>
                    ✓ Advies is actueel
                  </p>
                )
              })()}
            </div>
            {doc && (
              <button className="pdf-btn no-print" onClick={() => window.print()}>
                DOWNLOAD PDF ↓
              </button>
            )}
          </div>
        </div>

        {loading && (
          <p style={{ color: '#9ca3af', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase' }}>Laden...</p>
        )}

        {doc && (
          <div style={{ animation: 'fadein 0.5s ease' }}>

            {/* Voortgang — bovenaan */}
            <div className="coaching-section" style={{ borderTop: 'none', paddingTop: 0 }}>
              <span className="coaching-label">Jouw voortgang</span>
              {stats && (
                <div style={{ display: 'flex', gap: 48, marginBottom: 32, flexWrap: 'wrap' }}>
                  <div className="stat-block">
                    <div className="stat-number">{stats.sessionCount}</div>
                    <div className="stat-label">GESPREKKEN GEVOERD</div>
                  </div>
                  <div className="stat-block">
                    <div className="stat-number">{stats.totalQuestions}</div>
                    <div className="stat-label">VRAGEN GESTELD</div>
                  </div>
                  {analyses.length > 0 && (
                    <div className="stat-block">
                      <div className="stat-number">{analyses.length}</div>
                      <div className="stat-label">ANALYSES</div>
                    </div>
                  )}
                </div>
              )}
              <p className="coaching-body">{doc.voortgang}</p>
            </div>

            {/* Focus */}
            <div className="coaching-section">
              <span className="coaching-label">Waar jij op focust</span>
              <p className="coaching-body">{doc.focus}</p>
            </div>

            {/* Blinde vlekken */}
            <div className="coaching-section">
              <span className="coaching-label">Blinde vlekken</span>
              <p className="coaching-body">{doc.blinde_vlekken}</p>
            </div>

            {/* Ontwikkelpunten */}
            <div className="coaching-section">
              <span className="coaching-label">Jouw 3 ontwikkelpunten</span>
              <div style={{ marginTop: 8 }}>
                {doc.ontwikkelpunten.map((p, i) => (
                  <div key={i} className="ontwikkelpunt">
                    <span className="ontwikkelpunt-nr">{i + 1}</span>
                    <span className="ontwikkelpunt-text">{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Opdracht van de week */}
            <div className="coaching-section">
              <div className="opdracht-box">
                <span className="opdracht-label">Opdracht voor deze week</span>
                <p className="opdracht-text">{doc.opdracht}</p>
              </div>
            </div>

            {/* Aanbevolen blogs */}
            {doc.blogs.length > 0 && (
              <div className="coaching-section">
                <span className="coaching-label">Verdieping</span>
                <div style={{ marginTop: 8 }}>
                  {doc.blogs.map((b, i) => (
                    <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" className="blog-item">
                      {b.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {doc && (
          <div className="no-print" style={{ borderTop: '1px solid #374151', paddingTop: 40, marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#9ca3af', lineHeight: 1.7 }}>
              Wil je dit aanpakken met Arno zelf?<br />
              Maandelijks 45 minuten. Direct. Ongefilterd.
            </p>
            <a href="/upgrade" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, padding: '12px 36px', background: '#f59e0b', color: '#111827', textDecoration: 'none', borderRadius: 999, whiteSpace: 'nowrap' }}>
              BEKIJK ARNOLIVE →
            </a>
          </div>
        )}

        <div className="no-print" style={{ borderTop: '1px solid #374151', paddingTop: 40, marginTop: doc ? 48 : 0 }}>
          <Link href="/bot" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#f59e0b', textDecoration: 'none' }}>
            ← TERUG NAAR DE BOT
          </Link>
        </div>
      </div>
    </>
  )
}
