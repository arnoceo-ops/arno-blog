'use client'

import Link from 'next/link'
import BotNav from '@/app/bot/BotNav'

const FAQS = [
  {
    q: 'Wat is ArnoBot precies?',
    a: 'ArnoBot is een AI-salescoach die uitsluitend antwoord geeft vanuit de bibliotheek van Arno Diepeveen. 40 jaar sales-expertise, 369.000 woorden aan inzichten, cases en coaching. Geen internet, geen generieke AI.',
  },
  {
    q: 'Hoe gebruik ik het optimaal?',
    a: 'Wees concreet. Beschrijf je situatie, je markt en je uitdaging zo specifiek mogelijk. ArnoBot is geen zoekmachine; het is een coach. Stel vragen zoals je dat aan een senior advisor zou doen.',
  },
  {
    q: 'Is mijn gesprek privé?',
    a: 'Ja. Jouw sessies zijn volledig privé. Niemand anders heeft toegang tot jouw gesprekken.',
  },
  {
    q: 'Wat als het antwoord niet klopt?',
    a: 'ArnoBot antwoordt altijd vanuit de bibliotheek. Als een antwoord je verbaast, kun je doorvragen. Gebruik je eigen oordeel, net als bij een gesprek met een echte coach.',
  },
  {
    q: 'Wat is het verschil met ChatGPT?',
    a: 'ChatGPT is generiek. ArnoBot is uitsluitend getraind op Arno\'s content. Geen Wikipedia, geen internet. Alleen wat Arno heeft geschreven en gedoceerd in 40 jaar.',
  },
]

export default function QAClient({ isOnboarding }: { isOnboarding: boolean }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1f2937; color: #f1f5f9; font-family: 'Space Mono', monospace; }
        .qa-continue:hover { background: #d97706 !important; }
      `}</style>

      {isOnboarding ? (
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '0 clamp(20px, 4vw, 40px)', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(12px)',
        }}>
          <Link href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, color: '#f1f5f9', textDecoration: 'none' }}>
            ARNO<span style={{ color: '#f59e0b' }}>BOT.</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 48, height: 3, background: '#f59e0b', borderRadius: 2 }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2, color: '#f59e0b' }}>VIDEO</span>
            </div>
            <div style={{ width: 16, height: 1, background: '#374151', marginBottom: 13 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 48, height: 3, background: '#374151', borderRadius: 2 }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2, color: '#4b5563' }}>PROFIEL</span>
            </div>
          </div>
        </nav>
      ) : (
        <BotNav active="qa" />
      )}

      <div style={{ minHeight: '100vh', paddingTop: 64, background: '#111827' }}>
        <div style={{ maxWidth: 812, margin: '0 auto', padding: 'clamp(60px,8vw,80px) clamp(16px,4vw,20px) 80px' }}>

          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 8 }}>WELKOM</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 64px)', color: '#f1f5f9', lineHeight: 1.0, letterSpacing: 1, marginBottom: 16 }}>
            Voordat je begint.
          </h1>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, color: '#9ca3af', lineHeight: 1.9, marginBottom: 48, maxWidth: 520 }}>
            Kijk de introductievideo en lees de vragen hieronder.<br />
            Daarna richt je je profiel in. Dat duurt 3 minuten.
          </p>

          {/* Video */}
          <div style={{
            width: '100%',
            aspectRatio: '16/9',
            background: '#111827',
            border: '1px solid #374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 64,
            borderRadius: 4,
          }}>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 4, color: '#374151' }}>VIDEO KOMT BINNENKORT</p>
          </div>

          {/* FAQ */}
          <div style={{ borderTop: '3px solid #f59e0b', paddingTop: 40, marginBottom: 64 }}>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 8 }}>VRAGEN</p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: '#f1f5f9', letterSpacing: 1, marginBottom: 40 }}>
              Veel gestelde vragen
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ borderBottom: '1px solid #374151', paddingBottom: 28, marginBottom: 28 }}>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color: '#f1f5f9', marginBottom: 10 }}>{faq.q}</p>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, color: '#9ca3af', lineHeight: 1.9 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {isOnboarding && (
            <div style={{ textAlign: 'center' }}>
              <Link
                href="/bot/profiel"
                className="qa-continue"
                style={{
                  display: 'inline-block',
                  padding: '12px 36px',
                  background: '#f59e0b',
                  color: '#111827',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 18,
                  letterSpacing: 3,
                  textDecoration: 'none',
                  borderRadius: 999,
                  transition: 'background 0.2s',
                }}
              >
                I&apos;M READY.
              </Link>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
