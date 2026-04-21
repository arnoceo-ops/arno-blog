'use client'

import { useState, useRef, useEffect } from 'react'

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{part.slice(2, -2)}</strong>
    if ((part.startsWith('_') && part.endsWith('_')) || (part.startsWith('*') && part.endsWith('*')))
      return <em key={i}>{part.slice(1, -1)}</em>
    return part
  })
}

interface Message {
  role: 'user' | 'arno'
  content: string
}

const STARTERS = [
  'Waarom haal ik mijn target niet?',
  'Hoe kom ik binnen bij een nieuwe klant?',
  'Wat maakt een topverkoper anders?',
  'Hoe ga ik om met afwijzing?',
  'Wat is het verschil tussen verkopen en opdringen?',
  'Hoe bouw ik een winnend sales team?',
]

export default function ArnoChatbox() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<{role: string, content: string}[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function ask(question: string) {
    if (!question.trim() || loading) return

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
      setMessages(prev => [...prev, { role: 'arno', content: 'Er ging iets mis. Probeer het opnieuw.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="chat-header">
        <h2 className="chat-title">Vraag het<br /><span>Arno.</span></h2>
        <span className="chat-sub">Antwoorden gebaseerd op 15+ jaar blogs</span>
      </div>

      {messages.length === 0 && (
        <div className="chat-starters">
          {STARTERS.map((s, i) => (
            <button key={i} className="chat-starter" onClick={() => ask(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-arno'}>
              {msg.role === 'arno' && <strong>— Arno</strong>}
              {msg.role === 'arno' ? renderMarkdown(msg.content) : msg.content}
            </div>
          ))}
          {loading && <div className="chat-loading">Arno denkt na...</div>}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="chat-input-row">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask(input)}
          placeholder="Stel Arno een vraag over sales, strategie of mindset..."
          disabled={loading}
        />
        <button
          className="chat-send"
          onClick={() => ask(input)}
          disabled={loading}
        >
          {loading ? '...' : 'VRAAG →'}
        </button>
      </div>
    </div>
  )
}
