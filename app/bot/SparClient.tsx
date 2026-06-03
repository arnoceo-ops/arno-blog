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
  userId: string
  profiel: Record<string, unknown>
  taglineTitle: string
  taglineSub: string
  openers: string[]
}

const STRATEGISCH_ROLLEN = ['Sales Manager/Director', 'VP of Sales', 'CEO/DGA']

const VRAGEN_STRATEGISCH = [
  'Mijn salesteam haalt structureel de targets niet. Waar ligt het écht aan?',
  'Wat onderscheidt een winnende salesorganisatie van een gemiddelde?',
  'Wanneer is een salesstrategie echt een strategie en niet een wensenlijst?',
  'Hoe verkoop ik intern mijn strategie aan de board?',
  'Hoe bouw ik een commerciële strategie die de markt overspoelt?',
  'Mijn pipeline ziet er goed uit maar de conversie klopt niet. Waarom?',
  'Hoe stop ik met managen en begin ik met leiden?',
  'Mijn beste verkoper vertrekt. Hoe had ik dat kunnen voorkomen?',
  'Hoe zorg ik dat mijn mensen briljant worden in plaats van aardig?',
  'Hoe creëer ik een cultuur waarin excellentie de norm is?',
  'Wat is de grootste mindset-fout aka mindfuck van salesbazen?',
  'Wat moet ik anders doen om over een jaar marktleider te zijn?',
]

const VRAGEN_OPERATIONEEL = [
  'Ik werk keihard maar mijn pipeline blijft leeg. Waar gaat mijn energie naartoe?',
  'Mijn prospect zegt "te duur" — maar is dat de echte reden of geef ik hem een excuus?',
  'Wanneer is een eerste gesprek een investering en wanneer is het gewoon tijdverspilling?',
  'Ik presenteer goed, mijn offerte klopt, en toch tekent niemand. Wat zie ik niet?',
  'Mijn prospect was enthousiast. Tot ik de offerte stuurde. Wat ging er mis?',
  'Hoe verkoop ik op waarde als mijn klant alleen wil praten over prijs?',
  'Hoe weet ik of ik een deal aan het closen ben of aan het redden?',
  'Wat is de grootste mindfuck van verkopers die structureel underperformen?',
  'Hoe onderscheid ik me als ik objectief gezien hetzelfde verkoop als mijn concurrent?',
  'Mijn deal is al drie maanden "bijna rond". Wat klopt er niet?',
  'Wanneer is cold outreach gewoon doorzetten en wanneer is het jezelf voor de gek houden?',
  'Wanneer stop ik met verkopen en begin ik echt te overtuigen — en wat is het verschil?',
]

const VRAGEN_ORGANISATORISCH = [
  'Ik heb al zes maanden een vacature openstaan en niemand is goed genoeg. Wanneer is mijn standaard terecht en wanneer is het een excuus om niet te kiezen?',
  'Hoe weet ik tijdens een sollicitatiegesprek of iemand echt honger heeft of alleen maar zichzelf goed verkoopt?',
  'Mijn team presteert gemiddeld en ik doe alles om het beter te maken. Wat als ik het verkeerde team heb gebouwd?',
  'Ik coach mijn mensen al maanden maar er verandert niets. Wanneer is het hun probleem en wanneer is het het mijne?',
  'Wanneer is iemand een investering die tijd nodig heeft, en wanneer is hij gewoon een kostenpost die ik meesleep?',
  'Ik wil iemand ontslaan maar twijfel al weken. Wat zegt die twijfel eigenlijk over mij?',
  'Mijn beste mensen vertrekken naar concurrenten. Wat bied ik ze niet wat die concurrent wel biedt?',
  'Ik betaal mijn verkopers goed maar ze zijn niet hongerig. Hoe koop je precies wat je niet wil?',
  'Mijn team kan de huidige fase aan, maar niet de volgende. Bouw ik om ze heen of vervang ik ze?',
  'Mijn team accepteert middelmatigheid als norm. Hoe verander ik die norm zonder iedereen tegen me te krijgen?',
  'Wat is het verschil tussen iemand die loyaal is aan het bedrijf en iemand die gewoon nergens anders naartoe kan?',
  'Wanneer is een bonussysteem een motor en wanneer is het een pleister op een cultuurprobleem?',
]

export default function SparClient({ userId, profiel, taglineTitle, taglineSub, openers }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<{role: string, content: string}[]>([])
  const [started, setStarted] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [showSluiten, setShowSluiten] = useState(false)
  const [synthesisLoading, setSynthesisLoading] = useState(false)
  const [synthesisMessageCount, setSynthesisMessageCount] = useState(0)
  const [verfijnen, setVerfijnen] = useState(false)
  const [resizeInput, setResizeInput] = useState(false)
  const isStrategischProfiel = STRATEGISCH_ROLLEN.includes((profiel?.rol as string) ?? '')
  const [openerModus, setOpenerModus] = useState<'strategisch' | 'operationeel' | 'organisatorisch'>(
    isStrategischProfiel ? 'strategisch' : 'operationeel'
  )
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const existing = sessionStorage.getItem('arnobot_session')
    const id = existing || crypto.randomUUID()
    if (!existing) sessionStorage.setItem('arnobot_session', id)
    setSessionId(id)

    if (existing) {
      fetch(`/api/bot/session?sessionId=${existing}`)
        .then(r => r.json())
        .then(data => {
          if (data.messages?.length > 0) {
            setMessages(data.messages)
            setHistory(data.history)
            setStarted(true)
          }
        })
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (resizeInput && inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
      inputRef.current.focus()
      setResizeInput(false)
    }
  }, [resizeInput, input])

  function pickTopic(text: string) {
    setInput(text)
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.style.height = 'auto'
        inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
      }
    }, 0)
  }

  function reset() {
    const newId = crypto.randomUUID()
    sessionStorage.setItem('arnobot_session', newId)
    setSessionId(newId)
    setStarted(false)
    setMessages([])
    setHistory([])
    setInput('')
    setLoading(false)
    setBlocked(false)
    setShowSluiten(false)
    setSynthesisLoading(false)
    setSynthesisMessageCount(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => inputRef.current?.focus(), 150)
  }

  async function handleNieuw() {
    // Na synthese zonder nieuwe berichten: gewoon sluiten
    if (showSluiten && messages.length <= synthesisMessageCount) {
      reset()
      return
    }
    if (messages.length === 0) {
      reset()
      return
    }
    if (showSluiten) setShowSluiten(false)
    setSynthesisLoading(true)
    try {
      const res = await fetch('/api/bot/session-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messages })
      })
      const data = await res.json()
      if (data.summary) {
        const newCount = messages.length + 1
        setMessages(prev => [...prev, {
          role: 'arno',
          content: `**Terugblik op dit gesprek**\n\n${data.summary}`,
          hint: null
        }])
        setSynthesisMessageCount(newCount)
        const newId = crypto.randomUUID()
        sessionStorage.setItem('arnobot_session', newId)
        setSessionId(newId)
        setShowSluiten(true)
      } else {
        reset()
      }
    } catch {
      reset()
    } finally {
      setSynthesisLoading(false)
    }
  }

  async function ask(question: string) {
    if (!question.trim() || loading || blocked) return
    setStarted(true)
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setInput('')
    if (inputRef.current) { inputRef.current.style.height = '55px' }
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history, userId, profiel, sessionId })
      })
      const data = await res.json()

      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'arno', content: `Fout: ${data.error || res.status}` }])
        return
      }

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
        body { background: #141414; color: #f0ede6; font-family: 'Space Mono', monospace; }

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

        /* INPUT — BOVEN BIJ NIEUW GESPREK, STICKY-ONDER BIJ ACTIEF */
        .spar-input-area {
          background: #141414;
          padding: 40px 60px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .spar-input-area.active {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: rgba(10,10,10,0.97);
          border-top: 2px solid #EE7700;
          padding: 16px 60px;
          z-index: 50;
        }
        .spar-input-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px; letter-spacing: 3px; text-transform: uppercase;
          color: #444; margin-bottom: 10px; display: block; line-height: 1;
          width: 100%; max-width: 812px;
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
          font-size: 15px; font-weight: 400;
          padding: 13px 18px; outline: none;
          resize: none; overflow: hidden;
          min-height: 55px;
          line-height: 29px;
          display: block;
        }
        .spar-textarea::placeholder { color: #aaa; font-style: normal; font-size: 15px; font-weight: 400; }
        .spar-textarea:focus { background: #161616; }
        .spar-send {
          background: #EE7700; color: #141414;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 3px;
          padding: 0 32px; border: none; cursor: pointer;
          transition: background 0.2s; white-space: nowrap; min-width: 120px;
          min-height: 55px;
        }
        .spar-send:hover { background: #ff8800; }
        .spar-send:disabled { background: #333; color: #666; cursor: not-allowed; }
        .spar-reset {
          background: #111; color: #555;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 3px;
          padding: 0 24px; border: none; border-left: 1px solid #2a2a2a; cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
          min-height: 55px;
        }
        .spar-reset:hover { background: #1a1a1a; color: #f0ede6; }
        .spar-reset.sluiten { background: #EE7700; color: #141414; border-left-color: #EE7700; }
        .spar-reset.sluiten:hover { background: #ff8800; }
        .spar-input-intro {
          font-family: 'Barlow', sans-serif;
          font-size: 26px; font-weight: 700; color: rgb(240, 237, 230);
          width: 100%; max-width: 812px;
          display: block; margin-bottom: 20px; text-align: center;
        }
        .spar-discipline-label {
          font-family: 'Barlow', sans-serif;
          font-size: 26px; font-weight: 700; color: rgb(240, 237, 230);
          display: block; margin-bottom: 20px; text-align: center; width: 100%;
        }
        .spar-questions-label {
          font-family: 'Barlow', sans-serif;
          font-size: 26px; font-weight: 700; color: rgb(240, 237, 230);
          display: block; margin-top: 48px; margin-bottom: 12px; text-align: center; width: 100%;
        }
        .spar-questions-sub {
          font-family: 'Barlow', sans-serif;
          font-size: 16px; font-weight: 400; color: #666;
          display: block; margin-bottom: 40px; text-align: center; width: 100%;
        }
        .verfijn-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px; letter-spacing: 3px;
          color: #EE7700; padding: 6px 0 0; text-align: center;
          width: 100%; max-width: 812px;
          transition: opacity 0.15s;
        }
        .verfijn-btn:hover { opacity: 0.75; }
        .verfijn-btn:disabled { color: #555; cursor: not-allowed; }

        /* OPENERS */
        .spar-openers {
          padding: 72px 60px 0;
          border-bottom: 1px solid #1a1a1a;
        }
        .opener-toggle {
          display: flex; gap: 2px; margin-bottom: 2px; justify-content: center;
        }
        .toggle-btn {
          background: #111; border: none; color: #444;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px; letter-spacing: 3px;
          padding: 10px 24px; cursor: pointer;
          transition: all 0.15s;
        }
        .toggle-btn:hover { color: #888; }
        .toggle-btn.active { background: #EE7700; color: #141414; }
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
          background: #EE7700; color: #141414;
          border-bottom-color: transparent;
        }

        /* GESPREK */
        .spar-conversation {
          flex: 1;
          display: flex; flex-direction: column; gap: 0;
          max-width: 812px;
          width: 100%;
          margin: 0 auto;
          padding: 0 20px;
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
          font-size: 26px; line-height: 1.5; color: #f0ede6;
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
          font-size: 16px; line-height: 1.9; color: #d0cdc6;
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
          background: #EE7700; color: #141414;
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
          background: #EE7700; color: #141414;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 3px;
          padding: 12px 28px; text-decoration: none;
          border-radius: 999px;
          transition: background 0.2s;
        }
        .msg-cta-btn:hover { background: #ff8800; }

        /* EMPTY STATE */
        .empty-state {
          display: flex; flex-direction: column;
          padding: 0;
          animation: fadein 0.5s ease;
        }
        .empty-label {
          font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
          color: #333; padding: 32px 0 20px; display: block;
        }
        .empty-topics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          width: 100%;
          gap: 2px;
          margin-bottom: 2px;
        }
        @media (max-width: 700px) { .empty-topics { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .empty-topics { grid-template-columns: 1fr; } }
        .topic-btn {
          background: #111; border: none; color: #888;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(20px, 1.8vw, 28px); letter-spacing: 1.5px;
          padding: 32px 28px; cursor: pointer; text-align: left;
          line-height: 1.25; transition: all 0.15s;
        }
        .topic-btn:hover {
          background: #EE7700; color: #141414;
        }
      `}</style>

      <nav className="site-nav">
        <div className="nav-links">
          <Link href="/">HOME</Link>
          <span style={{ color: '#EE7700', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3 }}>BOT</span>
          <Link href="/bot/geschiedenis">ARCHIEF</Link>
          <Link href="/bot/account">ACCOUNT</Link>
        </div>
      </nav>

      <div className="spar-page" style={started ? { paddingBottom: 110 } : {}}>
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

        {!blocked && <div className={`spar-input-area${started ? ' active' : ''}`}>
          {!started && !loading && (
            <span className="spar-input-intro">begin een gesprek</span>
          )}
          <div className={`spar-input-row${started ? ' active-glow' : ''}`}>
            <textarea
              ref={inputRef}
              className="spar-textarea"
              value={input}
              onChange={e => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  ask(input)
                }
              }}
              placeholder={started ? "Ga verder." : "Stel je vraag"}
              disabled={loading || blocked}
              rows={1}
            />
            <button
              className="spar-send"
              onClick={() => ask(input)}
              disabled={loading || blocked || !input.trim()}
            >
              {loading ? '...' : 'VRAAG →'}
            </button>
            {started && (
              <button
                className={`spar-reset${showSluiten && messages.length <= synthesisMessageCount ? ' sluiten' : ''}`}
                onClick={handleNieuw}
                disabled={synthesisLoading}
              >
                {synthesisLoading ? '...' : (showSluiten && messages.length <= synthesisMessageCount) ? 'SLUITEN' : 'NIEUW'}
              </button>
            )}
          </div>
          {input.trim().length > 5 && (
            <button
              className="verfijn-btn"
              disabled={verfijnen || loading}
              onClick={async () => {
                setVerfijnen(true)
                try {
                  const res = await fetch('/api/bot/verfijn', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ vraag: input, profiel })
                  })
                  const data = await res.json()
                  if (data.verfijnd) {
                    setInput(data.verfijnd)
                    setResizeInput(true)
                  }
                } catch {}
                finally { setVerfijnen(false) }
              }}
            >
              {verfijnen ? '...' : '↑ VERFIJN MIJN VRAAG'}
            </button>
          )}
        </div>}

        {!started && !loading && (
          <div className="spar-openers">
            <span className="spar-discipline-label">of kies een discipline</span>
            <div className="opener-toggle">
              <button
                className={`toggle-btn${openerModus === 'operationeel' ? ' active' : ''}`}
                onClick={() => setOpenerModus('operationeel')}
              >OPERATIONEEL</button>
              <button
                className={`toggle-btn${openerModus === 'strategisch' ? ' active' : ''}`}
                onClick={() => setOpenerModus('strategisch')}
              >STRATEGISCH</button>
              <button
                className={`toggle-btn${openerModus === 'organisatorisch' ? ' active' : ''}`}
                onClick={() => setOpenerModus('organisatorisch')}
              >ORGANISATORISCH</button>
            </div>
            <span className="spar-questions-label">en selecteer een van de onderstaande vragen</span>
            <span className="spar-questions-sub">als het je bezighoudt, dan hè? waarom zou je er anders antwoord op willen hebben?</span>
            <div className="openers-grid">
              {(openerModus === 'strategisch' ? VRAGEN_STRATEGISCH : openerModus === 'organisatorisch' ? VRAGEN_ORGANISATORISCH : VRAGEN_OPERATIONEEL).map((q, i) => (
                <button key={i} className="opener-btn" onClick={() => ask(q)}>{q}</button>
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
