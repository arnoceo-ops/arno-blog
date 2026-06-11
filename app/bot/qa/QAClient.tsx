'use client'

import { useState } from 'react'
import Link from 'next/link'
import BotNav from '@/app/bot/BotNav'

const FAQ_GROUPS = [
  {
    label: 'OVER ARNOBOT',
    items: [
      {
        q: 'Wat is ArnoBot precies?',
        a: 'ArnoBot is een AI-salescoach die uitsluitend antwoord geeft vanuit de bibliotheek van Arno Diepeveen. 40 jaar sales-expertise, 369.000 woorden aan inzichten, cases en coaching. Geen internet, geen generieke AI.',
      },
      {
        q: 'Waarom geen ChatGPT o.i.d.?',
        a: 'ChatGPT is een generieke LLM. Het middelt wat het kan vinden. ArnoBot heeft focus op jouw profiel, groei en succes. Dat wordt gematcht met supergerichte data. ArnoBot redeneert uitsluitend binnen het kader van Arno\'s content.',
      },
      {
        q: 'Wat als het antwoord niet klopt?',
        a: 'ArnoBot antwoordt altijd vanuit de bibliotheek. Als een antwoord je verbaast, kun je doorvragen. Gebruik je eigen oordeel, net als bij een gesprek met een echte coach.',
      },
    ],
  },
  {
    label: 'GEBRUIK',
    items: [
      {
        q: 'Hoe gebruik ik het optimaal?',
        a: 'Wees concreet. Beschrijf je situatie, je markt en je uitdaging zo specifiek mogelijk. ArnoBot is geen zoekmachine; het is een coach. Stel vragen zoals je dat aan een senior advisor zou doen.',
      },
      {
        q: 'Hoe komt een coachingsadvies tot stand?',
        a: 'Arno combineert alles wat hij over je weet. Hij kijkt naar je recente gesprekken, de patroonanalyses die je al hebt laten maken in de BIEB, je profiel en de richting van je vorige MSA-score. Op basis daarvan trekt hij een lijn: wat is er aan het veranderen, wat staat vast, en wat vraagt nu aandacht. Hoe meer gesprekken en analyses je hebt opgebouwd, hoe scherper en persoonlijker het beeld.',
      },
      {
        q: 'Waarom kan ik maximaal 20 gesprekken selecteren voor een analyse?',
        a: 'Een analyse wordt scherper als Arno zich kan focussen. Boven de 20 gesprekken verdunnen de patronen zich — je krijgt dan een gemiddelde in plaats van een diagnose. Twintig gesprekken is het maximum waarbij de analyse nog concreet en bruikbaar is.',
      },
    ],
  },
  {
    label: 'PRIVACY',
    items: [
      {
        q: 'Zijn mijn gegevens veilig?',
        a: (
          <>
            Jouw gesprekken en profiel zijn strikt vertrouwelijk. We slaan je gegevens op bij gecertificeerde sub-verwerkers (Supabase, Clerk, Vercel, Anthropic). Je kunt je data altijd downloaden of je account verwijderen. Lees onze{' '}
            <a href="/privacy" style={{ color: '#f59e0b', textDecoration: 'none' }}>privacyverklaring</a>.
          </>
        ),
      },
    ],
  },
]

export default function QAClient({ isOnboarding }: { isOnboarding: boolean }) {
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111827; color: #f1f5f9; font-family: 'Space Mono', monospace; font-weight: 400; }
        .qa-continue:hover { background: #d97706 !important; }
        .faq-item { border-bottom: 1px solid #374151; }
        .faq-question {
          width: 100%; background: none; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px 0; gap: 16px; text-align: left;
        }
        .faq-question:hover .faq-q-text { color: #f1f5f9; }
        .faq-q-text {
          font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px;
          color: #9ca3af; transition: color 0.15s; line-height: 1.3;
        }
        .faq-q-text.open { color: #f59e0b; }
        .faq-arrow {
          font-family: 'Bebas Neue', sans-serif; font-size: 18px;
          color: #4b5563; flex-shrink: 0; transition: color 0.15s;
        }
        .faq-arrow.open { color: #f59e0b; }
        .faq-answer {
          font-family: 'Space Mono', monospace; font-size: 15px;
          color: #9ca3af; line-height: 1.9; padding-bottom: 28px;
        }
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

          <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 8 }}>ARNOBOT</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 64px)', color: '#f1f5f9', lineHeight: 1.0, letterSpacing: 3, marginBottom: 16 }}>
            Video
          </h1>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, color: '#9ca3af', lineHeight: 1.9, marginBottom: 48 }}>
            Dit is de video die je bij je ArnoBot entree hebt gezien. Heb je vragen die hier niet beantwoord worden? Neem dan contact op met Arno op{' '}
            <a href="https://t.me/arnodiepeveen" target="_blank" rel="noopener noreferrer" style={{ color: '#f59e0b', textDecoration: 'none' }}>Telegram</a>. Niet de bot, de man 😎
          </p>

          {/* Video */}
          <div style={{
            width: '100%', aspectRatio: '16/9', background: '#1f2937',
            border: '1px solid #374151', display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: 64, borderRadius: 4,
          }}>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 4, color: '#374151' }}>VIDEO KOMT BINNENKORT</p>
          </div>

          {/* FAQ */}
          <div style={{ borderTop: '3px solid #f59e0b', paddingTop: 40, marginBottom: 64 }}>
            <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 13, letterSpacing: 4, color: '#f59e0b', marginBottom: 8 }}>VRAGEN</p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, color: '#f1f5f9', lineHeight: 1.0, marginBottom: 48 }}>
              FAQ
            </h2>

            {FAQ_GROUPS.map((group, gi) => (
              <div key={gi} style={{ marginBottom: 48 }}>
                <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 11, letterSpacing: 4, color: '#f59e0b', marginBottom: 4, textTransform: 'uppercase' }}>{group.label}</p>
                <div style={{ borderTop: '1px solid #374151' }}>
                  {group.items.map((faq, fi) => {
                    const key = `${gi}-${fi}`
                    const isOpen = openKey === key
                    return (
                      <div key={fi} className="faq-item">
                        <button
                          className="faq-question"
                          onClick={() => setOpenKey(isOpen ? null : key)}
                        >
                          <span className={`faq-q-text${isOpen ? ' open' : ''}`}>{faq.q}</span>
                          <span className={`faq-arrow${isOpen ? ' open' : ''}`}>{isOpen ? '↑' : '↓'}</span>
                        </button>
                        {isOpen && (
                          <p className="faq-answer">{faq.a}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {isOnboarding && (
            <div style={{ textAlign: 'center' }}>
              <Link
                href="/bot/profiel"
                className="qa-continue"
                style={{
                  display: 'inline-block', padding: '12px 36px',
                  background: '#f59e0b', color: '#111827',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 18, letterSpacing: 3,
                  textDecoration: 'none', borderRadius: 999, transition: 'background 0.2s',
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
