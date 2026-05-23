'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

function renderContent(text: string) {
  return text
    .replace(/\[([^\]]+)\]\s*\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#EE7700;text-decoration:underline">$1</a>')
    .replace(/(?<!\()(https?:\/\/[^\s<"]+)/g, (url, _, offset, str) => str[offset - 1] === '"' ? url : `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#EE7700;text-decoration:underline">${url}</a>`)
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/_([^_\n]+)_/g, '<em>$1</em>')
}

interface Message {
  role: 'user' | 'arno'
  content: string
  hint?: string | null
}

interface Props {
  taglineTitle: string
  taglineSub: string
  openers: string[]
}

export default function SparClient({ taglineTitle, taglineSub, openers }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<{role: string, content: string}[]>([])
  const [started, setStarted] = useState(false)
  const [blinkGlow, setBlinkGlow] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function reset() {
    setStarted(false)
    setMessages([])
    setHistory([])
    setInput('')
    setBlinkGlow(false)
    setBlocked(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function triggerBlink() {
    setBlinkGlow(true)
    setTimeout(() => setBlinkGlow(false), 1800)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  async function ask(question: string) {
    if (!question.trim() || loading || blocked) return
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

      if (data.blocked) {
        setBlocked(true)
        setMessages(prev => [...prev, { role: 'arno', content: '', hint: 'blocked' }])
        return
      }

      const answer = data.answer || 'Geen antwoord ontvangen.'
      setMessages(prev => [...prev, { role: 'arno', content: answer, hint: data.hint ?? null }])
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
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Barlow:wght@400;700&family=Barlow+Condensed:wght@300;600;900&display=swap');
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
          min-height: 100vh; padding-top: 80px;
          display: flex; flex-direction: column;
        }

        /* HERO */
        .spar-hero {
          padding: 80px 60px 60px;
          border-bottom: 3px solid #EE7700;
          display: flex; justify-content: space-between; align-items: flex-end;
        }
        .spar-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(64px, 10vw, 120px);
          line-height: 0.9; letter-spacing: -2px;
        }
        .spar-title span { color: #EE7700; }
        .spar-tagline {
          text-align: right; padding-bottom: 8px; max-width: 520px;
        }
        .spar-tagline p { font-size: 15px; line-height: 1.9; color: #aaa; }
        .spar-tagline strong { font-weight: 700; color: #f0ede6; font-family: 'Barlow', sans-serif; font-size: 26px; letter-spacing: 0.5px; display: block; margin-bottom: 6px; }

        /* INPUT — PROMINENT BOVENAAN */
        .spar-input-area {
          background: #0a0a0a;
          padding: 28px 60px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .spar-input-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 4vw, 56px); letter-spacing: 2px; text-transform: uppercase;
          color: #f0ede6; margin-bottom: 16px; display: block; line-height: 1;
          width: 100%; max-width: 812px; text-align: center;
        }
        .spar-input-row {
          display: flex; gap: 0;
          border: 2px solid #EE7700;
          width: 100%; max-width: 812px;
        }
        .spar-textarea {
          flex: 1;
          background: #111;
          border: none;
          color: #f0ede6;
          font-family: 'Space Mono', monospace;
          font-size: 13px; padding: 14px 18px; outline: none;
          resize: none; min-height: 48px; max-height: 48px;
          line-height: 1.5;
        }
        .spar-textarea::placeholder { color: #555; font-style: normal; font-size: 12px; }
        .spar-textarea:focus { background: #161616; }
        .spar-send {
          background: #EE7700; color: #0a0a0a;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 3px;
          padding: 0 32px; border: none; cursor: pointer;
          transition: background 0.2s; white-space: nowrap; min-width: 120px;
        }
        .spar-send:hover { background: #ff8800; }
        .spar-send:disabled { background: #1a1a1a; color: #2a2a2a; cursor: not-allowed; }
        .spar-hint {
          font-size: 10px; letter-spacing: 2px; color: #2a2a2a;
          text-transform: uppercase; margin-top: 8px; padding-bottom: 28px;
          width: 100%; max-width: 812px; text-align: center;
        }

        /* OPENERS */
        .spar-openers {
          padding: 0 60px 0;
          border-bottom: 1px solid #1a1a1a;
        }
        .openers-label {
          font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
          color: #333; padding: 32px 0 20px; display: block;
        }
        .openers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          width: 100%;
          gap: 2px;
          margin-bottom: 2px;
        }
        @media (max-width: 900px) { .openers-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .openers-grid { grid-template-columns: 1fr; } }
        .opener-btn {
          background: #111; border: none; color: #888;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(20px, 1.8vw, 28px); letter-spacing: 1.5px;
          padding: 32px 36px; cursor: pointer; text-align: left;
          line-height: 1.25; transition: all 0.15s;
          border-bottom: 2px solid transparent;
        }
        .opener-btn:hover {
          background: #EE7700; color: #0a0a0a;
          border-bottom-color: transparent;
        }

        /* GESPREK */
        .spar-conversation {
          flex: 1; padding: 0 60px;
          display: flex; flex-direction: column; gap: 0;
        }

        .msg-user {
          padding: 40px 0; border-bottom: 1px solid #141414;
          display: flex; gap: 40px; align-items: flex-start;
        }
        .msg-user-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px; letter-spacing: 3px;
          color: #333; white-space: nowrap; padding-top: 4px; min-width: 80px;
        }
        .msg-user-text {
          font-size: 22px; line-height: 1.5; color: #f0ede6;
          font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.5px;
        }

        .msg-arno {
          padding: 40px 0; border-bottom: 1px solid #141414;
          display: flex; gap: 40px; align-items: flex-start;
        }
        .msg-arno-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px; letter-spacing: 3px;
          color: #EE7700; white-space: nowrap; padding-top: 4px; min-width: 80px;
        }
        .msg-arno-text {
          font-size: 15px; line-height: 2; color: #aaa;
          max-width: 680px; white-space: pre-wrap;
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

        /* GLOW op invoerveld na gesprek */
        .spar-input-row.active-glow {
          border-color: #EE7700;
          box-shadow: 0 0 0 3px rgba(238,119,0,0.25), 0 0 24px rgba(238,119,0,0.15);
          animation: glowpulse 2s ease-in-out infinite;
        }
        .spar-input-row.blink-glow {
          animation: blinkglow 0.4s ease-in-out 4;
        }
        @keyframes glowpulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(238,119,0,0.2), 0 0 16px rgba(238,119,0,0.1); }
          50% { box-shadow: 0 0 0 3px rgba(238,119,0,0.5), 0 0 40px rgba(238,119,0,0.3); }
        }
        @keyframes blinkglow {
          0%, 100% { box-shadow: 0 0 0 3px rgba(238,119,0,0.15); }
          50% { box-shadow: 0 0 0 6px rgba(238,119,0,0.7), 0 0 48px rgba(238,119,0,0.4); border-color: #ff9900; }
        }

        /* ACTIE KNOPPEN onder antwoord */
        .msg-actions {
          padding: 20px 0 20px 120px;
          display: flex; gap: 12px; align-items: center;
          border-bottom: 1px solid #141414;
          animation: fadein 0.4s ease;
        }
        @keyframes fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .msg-action-btn {
          background: none; border: 1px solid #2a2a2a;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 15px; letter-spacing: 2px;
          padding: 10px 20px; cursor: pointer; transition: all 0.15s;
        }
        .msg-action-btn.primary {
          color: #EE7700; border-color: #EE7700;
        }
        .msg-action-btn.primary:hover {
          background: #EE7700; color: #0a0a0a;
        }
        .msg-action-btn.secondary {
          color: #444; border-color: #222;
        }
        .msg-action-btn.secondary:hover {
          border-color: #555; color: #888;
        }

        /* HINT / CTA BLOKKEN */
        .msg-hint {
          padding: 16px 0 16px 120px;
          font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
          color: #EE7700; border-bottom: 1px solid #141414;
          animation: fadein 0.4s ease;
        }
        .msg-cta {
          padding: 24px 0 24px 120px;
          border-bottom: 1px solid #141414;
          animation: fadein 0.4s ease;
        }
        .msg-cta p {
          font-size: 13px; letter-spacing: 1px; color: #888; margin-bottom: 14px;
        }
        .msg-cta-btn {
          display: inline-block;
          background: #EE7700; color: #0a0a0a;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 3px;
          padding: 12px 28px; text-decoration: none;
          border-radius: 999px;
          transition: background 0.2s;
        }
        .msg-cta-btn:hover { background: #ff8800; }
      `}</style>

      <nav className="site-nav">
        <div className="nav-links">
          <Link href="/">HOME</Link>
          <Link href="/spar" className="nav-active">ARNOBOT</Link>
          <Link href="/bio">BIO</Link>
          <Link href="/blog">BLOG</Link>
          <a href="https://salescanvas.app" target="_blank" rel="noopener noreferrer">CANVAS</a>
          <a href="/#subscribe" className="nav-cta">SUBSCRIBE</a>
        </div>
      </nav>

      <div className="spar-page">
        <div className="spar-hero">
          <h1 className="spar-title">
            ARNO<br /><span>BOT.</span>
          </h1>
          <div className="spar-tagline">
            <p>
              <strong>{taglineTitle}</strong><br />
              {taglineSub}
            </p>
          </div>
        </div>

        {!blocked && <div className="spar-input-area">
          <span className="spar-input-label">
            {started ? '↓ Volgende vraag — ga door' : '↓ Stel je vraag — geen filter, geen bullshit'}
          </span>
          <div className={`spar-input-row${started ? (blinkGlow ? ' blink-glow' : ' active-glow') : ''}`}>
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
              placeholder="Tsja, stel eens een goeie vraag..."
              disabled={loading || blocked}
              rows={2}
            />
            <button
              className="spar-send"
              onClick={() => ask(input)}
              disabled={loading || blocked || !input.trim()}
            >
              {loading ? '...' : 'SPAR →'}
            </button>
          </div>
          <p className="spar-hint">Enter = sturen — Shift+Enter = nieuwe regel</p>
        </div>}

        {!started && (
          <div className="spar-openers">
              <div className="openers-grid">
              {openers.map((q, i) => (
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
              <div key={i}>
                {msg.content && (
                  <div className="msg-arno">
                    <span className="msg-arno-label">ARNO</span>
                    <span className="msg-arno-text" dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                  </div>
                )}
                {msg.hint === 'last_chance' && (
                  <div className="msg-hint">
                    Lekker bezig. Je hebt nog één kans om echt tot de kern te komen.
                  </div>
                )}
                {(msg.hint === 'salescanvas' || msg.hint === 'blocked') && (
                  <div className="msg-cta">
                    <p>{msg.hint === 'blocked' ? 'Toch proberen, hè? 😂' : <>Als je echt de diepte in wilt, doe dan een free trial op <a href="https://salescanvas.app" target="_blank" rel="noopener noreferrer" style={{color:'#EE7700'}}>salescanvas.app</a></>}</p>
                    <a href="https://salescanvas.app" target="_blank" rel="noopener noreferrer" className="msg-cta-btn">
                      SALESCANVAS
                    </a>
                  </div>
                )}
                {i === messages.length - 1 && !loading && !blocked && msg.hint !== 'blocked' && msg.content && (
                  <div className="msg-actions">
                    <button className="msg-action-btn primary" onClick={triggerBlink}>
                      ↑ Vervolgvraag stellen
                    </button>
                    <button className="msg-action-btn secondary" onClick={reset}>
                      ← Nieuwe sessie
                    </button>
                  </div>
                )}
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
      </div>
    </>
  )
}
