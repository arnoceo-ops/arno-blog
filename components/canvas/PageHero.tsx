// PageHero.tsx
// Plaatsen in: components/canvas/PageHero.tsx
// Gebruik: <PageHero number={1} title="STRATEGIE" />

import React from 'react'

interface PageHeroProps {
  number: number        // 1 = Strategie, 2 = Mensen, 3 = Uitvoering
  title: string         // 'STRATEGIE' | 'MENSEN' | 'UITVOERING'
}

// Elk thema heeft een uniek gradient/patroon passend bij het originele document
const themes: Record<number, { gradient: string; accent: string }> = {
  1: {
    // Strategie — koud, krachtig (beer/vis imagery in origineel)
    gradient: 'linear-gradient(135deg, #0d1117 0%, #1a2a1a 40%, #0d1117 70%, #1c1a17 100%)',
    accent: '#2a4a2a',
  },
  2: {
    // Mensen — warm, menselijk (sollicitanten/Matrix imagery)
    gradient: 'linear-gradient(135deg, #0d0d0d 0%, #1a1209 40%, #0d0d0d 70%, #1c1a17 100%)',
    accent: '#3a2a10',
  },
  3: {
    // Uitvoering — dynamisch, snel (atleet/cheetah imagery)
    gradient: 'linear-gradient(135deg, #0a0f1a 0%, #1a1020 40%, #0a0f1a 70%, #1c1a17 100%)',
    accent: '#1a1030',
  },
}

export function PageHero({ number, title }: PageHeroProps) {
  const theme = themes[number] || themes[1]

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '280px',
      overflow: 'hidden',
      background: theme.gradient,
      marginBottom: '0',
    }}>

      {/* Achtergrond textuur — diagonale lijnen */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 60px,
          rgba(255,255,255,0.012) 60px,
          rgba(255,255,255,0.012) 61px
        )`,
        pointerEvents: 'none',
      }} />

      {/* Oranje gloed links — filmisch lichtlek */}
      <div style={{
        position: 'absolute',
        bottom: '-40px',
        left: '-60px',
        width: '400px',
        height: '200px',
        background: 'radial-gradient(ellipse at center, rgba(238,119,0,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Verticale scheidingslijn midden — zoals in origineel */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: '1px',
        background: 'linear-gradient(to bottom, transparent, rgba(238,119,0,0.3) 30%, rgba(238,119,0,0.3) 70%, transparent)',
        pointerEvents: 'none',
      }} />

      {/* Centrum: kroontje + SALES CANVAS */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}>
        {/* Kroontje SVG — RDS stijl */}
        <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
          <path d="M2 22L8 8L14 16L18 4L22 16L28 8L34 22H2Z" fill="#EE7700" opacity="0.9"/>
          <rect x="2" y="23" width="32" height="3" rx="1" fill="#EE7700" opacity="0.7"/>
        </svg>
        <div style={{
          fontFamily: 'var(--font-barlow, sans-serif)',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '6px',
          color: '#f0ede6',
          opacity: 0.85,
        }}>
          SALES CANVAS
        </div>
      </div>

      {/* Links onderin: sectienummer + titel */}
      <div style={{
        position: 'absolute',
        bottom: '36px',
        left: '48px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        <div style={{
          fontFamily: 'var(--font-barlow, sans-serif)',
          fontSize: '11px',
          letterSpacing: '3px',
          color: '#EE7700',
          opacity: 0.7,
        }}>
          #{number < 10 ? `0${number}` : number}
        </div>
        <div style={{
          fontFamily: 'var(--font-bebas), sans-serif',
          fontSize: '64px',
          letterSpacing: '8px',
          color: '#f0ede6',
          lineHeight: 1,
          textShadow: '0 2px 40px rgba(0,0,0,0.8)',
        }}>
          {title}
        </div>
      </div>

      {/* Rechts onderin: subtiele RDS tekst */}
      <div style={{
        position: 'absolute',
        bottom: '36px',
        right: '48px',
        fontFamily: 'var(--font-barlow, sans-serif)',
        fontSize: '10px',
        letterSpacing: '4px',
        color: '#f0ede6',
        opacity: 0.2,
      }}>
        ROYAL DUTCH SALES
      </div>

      {/* Onderrand: oranje lijn */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(to right, transparent, #EE7700 30%, #EE7700 70%, transparent)',
        opacity: 0.4,
      }} />

    </div>
  )
}
