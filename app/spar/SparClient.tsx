'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'arno'
  content: string
}

const OPENERS = [
  'Waarom haal ik mijn target niet?',
  'Hoe kom ik binnen bij een nieuwe klant?',
  'Wat maakt een topverkoper anders dan de rest?',
  'Hoe ga ik om met afwijzing?',
  'Mijn team presteert onder de maat. Wat nu?',
  'Hoe bouw ik een winnend sales team?',
  'Wat is het verschil tussen verkopen en opdringen?',
  'Hoe overtuig ik een sceptische klant?',
]

export default function SparClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<{role: string, content: string}[]>([])
  const [started, setStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function ask(question: string) {
    if (!question.trim() || loading) return
    setStarted(true)
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history })
      })
      const data = await res.json()
      const answer = data.answer || 'Geen antwoord ontvangen.'
      setMessages(prev => [...prev, { role: 'arno', content: answer }])
      setHistory(prev => [
        ...prev,
        { role: 'user', content: question },
        { role: 'assistant', content: answer }
      ])
    } catch {
      setMessages(prev => [...prev, { role: 'arno', content: 'Er ging iets mis. Probeer opnieuw.' }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@300;600;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { background: #0a0a0a; color: #f0ede6; font-family: 'Space Mono', monospace; }

        /* NAV */
        .site-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 16px 40px; display: flex; justify-content: center;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,10,10,0.95); backdrop-filter: blur(12px);
        }
        .nav-links { display: flex; gap: 48px; align-items: center; }
        .nav-links a {
          color: #888; text-decoration: none; font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 3px; transition: color 0.2s;
        }
        .nav-links a:hover { color: #f0ede6; }
        .nav-active { color: #EE7700 !important; }
        .nav-cta { color: #EE7700 !important; }

        /* SPAR LAYOUT */
        .spar-page {
          min-height: 100vh;
          padding-top: 80px;
          display: flex;
          flex-direction: column;
        }

        /* HERO */
        .spar-hero {
          padding: 80px 60px 60px;
          border-bottom: 3px solid #EE7700;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .spar-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(80px, 12vw, 160px);
          line-height: 0.85;
          letter-spacing: -2px;
        }
        .spar-title span { color: #EE7700; }
        .spar-tagline {
          text-align: right;
          padding-bottom: 8px;
          max-width: 360px;
        }
        .spar-tagline p {
          font-size: 13px; line-height: 2; color: #555;
        }
        .spar-tagline strong {
          font-weight: normal; color: #888;
        }

        /* OPENERS */
        .spar-openers {
          padding: 60px 60px 0;
        }
        .openers-label {
          font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
          color: #333; margin-bottom: 24px;
        }
        .openers-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          margin-bottom: 2px;
        }
        @media (max-width: 1024px) { .openers-grid { grid-template-columns: repeat(2, 1fr); } }
        .opener-btn {
          background: #111; border: none; color: #666;
          font-family: 'Space Mono', monospace; font-size: 12px;
          padding: 20px 24px; cursor: pointer; text-align: left;
          line-height: 1.6; transition: all 0.2s;
          border-left: 3px solid transparent;
        }
        .opener-btn:hover {
          background: #161616; color: #f0ede6;
          border-left-color: #EE7700;
        }

        /* GESPREK */
        .spar-conversation {
          flex: 1;
          padding: 0 60px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .msg-user {
          padding: 40px 0;
          border-bottom: 1px solid #141414;
          display: flex;
          gap: 40px;
          align-items: flex-start;
        }
        .msg-user-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px; letter-spacing: 3px;
          color: #333; white-space: nowrap; padding-top: 4px;
          min-width: 80px;
        }
        .msg-user-text {
          font-size: 20px; line-height: 1.6; color: #f0ede6;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; letter-spacing: 0.5px;
        }

        .msg-arno {
          padding: 40px 0;
          border-bottom: 1px solid #141414;
          display: flex;
          gap: 40px;
          align-items: flex-start;
          background: transparent;
        }
        .msg-arno-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px; letter-spacing: 3px;
          color: #EE7700; white-space: nowrap; padding-top: 4px;
          min-width: 80px;
        }
        .msg-arno-text {
          font-size: 15px; line-height: 2; color: #aaa;
          max-width: 680px;
          white-space: pre-wrap;
        }

        .msg-loading {
          padding: 40px 0 40px 120px;
          display: flex; align-items: center; gap: 16px;
        }
        .loading-dots { display: flex; gap: 6px; }
        .loading-dot {
          width: 8px; height: 8px; background: #EE7700; border-radius: 50%;
          animation: pulse 1.2s ease-in-out infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        .loading-text {
          font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #333;
        }

        /* INPUT */
        .spar-input-area {
          position: sticky;
          bottom: 0;
          background: #0a0a0a;
          border-top: 1px solid #1a1a1a;
          padding: 24px 60px;
          display: flex;
          gap: 0;
        }
        .spar-textarea {
          flex: 1;
          background: #111; border: 1px solid #222; border-right: none;
          color: #f0ede6; font-family: 'Space Mono', monospace;
          font-size: 13px; padding: 16px 20px; outline: none;
          resize: none; min-height: 56px; max-height: 160px;
          line-height: 1.6;
        }
        .spar-textarea::placeholder { color: #333; }
        .spar-send {
          background: #EE7700; color: #0a0a0a;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 3px;
          padding: 0 36px; border: none; cursor: pointer;
          transition: background 0.2s; white-space: nowrap;
          min-width: 140px;
        }
        .spar-send:hover { background: #ff8800; }
        .spar-send:disabled { background: #222; color: #444; cursor: not-allowed; }
        .spar-hint {
          font-size: 10px; letter-spacing: 2px; color: #2a2a2a;
          text-transform: uppercase; padding: 8px 60px 0;
        }
      `}</style>

      <nav className="site-nav">
        <div className="nav-links">
          <Link href="/">HOME</Link>
          <Link href="/blog">BLOG</Link>
          <Link href="/bio">BIO</Link>
          <Link href="/canvas">CANVAS</Link>
          <Link href="/spar" className="nav-active nav-cta">SPAR</Link>
          <a href="/#subscribe" className="nav-cta">SUBSCRIBE</a>
        </div>
      </nav>

      <div className="spar-page">
        <div className="spar-hero">
          <h1 className="spar-title">
            LET&apos;S<br /><span>SPAR.</span>
          </h1>
          <div className="spar-tagline">
            <p>
              <strong>15 jaar blogs. 167.000 woorden.</strong><br />
              Stel je vraag over sales, strategie of mindset.<br />
              Geen bullshit. Geen corporate taal.<br />
              Gewoon Arno — direct en ongefilterd.
            </p>
          </div>
        </div>

        {!started && (
          <div className="spar-openers">
            <p className="openers-label">Of begin hier</p>
            <div className="openers-grid">
              {OPENERS.map((q, i) => (
                <button key={i} className="opener-btn" onClick={() => ask(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="spar-conversation">
          {messages.map((msg, i) => (
            msg.role === 'user' ? (
              <div key={i} className="msg-user">
                <span className="msg-user-label">JIJ</span>
                <span className="msg-user-text">{msg.content}</span>
              </div>
            ) : (
              <div key={i} className="msg-arno">
                <span className="msg-arno-label">ARNO</span>
                <span className="msg-arno-text">{msg.content}</span>
              </div>
            )
          ))}
          {loading && (
            <div className="msg-loading">
              <div className="loading-dots">
                <div className="loading-dot" />
                <div className="loading-dot" />
                <div className="loading-dot" />
              </div>
              <span className="loading-text">Arno denkt na</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="spar-input-area">
          <textarea
            ref={inputRef}
            className="spar-textarea"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                ask(input)
              }
            }}
            placeholder="Stel je vraag..."
            disabled={loading}
            rows={1}
          />
          <button
            className="spar-send"
            onClick={() => ask(input)}
            disabled={loading || !input.trim()}
          >
            {loading ? '...' : 'SPAR →'}
          </button>
        </div>
        {!loading && <p className="spar-hint">Enter om te sturen — Shift+Enter voor nieuwe regel</p>}
      </div>
    </>
  )
}
