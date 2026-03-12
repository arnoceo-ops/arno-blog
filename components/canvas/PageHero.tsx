'use client'

// PageHero.tsx
// Locatie: components/canvas/PageHero.tsx

interface PageHeroProps {
  number: number
  title: string
}

const heroConfig: Record<number, { image: string }> = {
  1: { image: '/canvas/strategie-hero.png' },
  2: { image: '/canvas/mensen-hero.png' },
  3: { image: '/canvas/uitvoering-hero.png' },
}

export function PageHero({ number }: PageHeroProps) {
  const config = heroConfig[number] || heroConfig[1]

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '480px',
      overflow: 'hidden',
      backgroundColor: '#1c1a17',
    }}>

      {/* Achtergrond foto — volledig zichtbaar */}
      <img
        src={config.image}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          filter: 'grayscale(15%) brightness(0.6)',
        }}
      />

      {/* Donkere overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(10,8,6,0.65) 0%, rgba(10,8,6,0.25) 50%, rgba(10,8,6,0.45) 100%)',
      }} />

      {/* Oranje gloed linksonder */}
      <div style={{
        position: 'absolute',
        bottom: '-40px',
        left: '-40px',
        width: '350px',
        height: '200px',
        background: 'radial-gradient(ellipse at center, rgba(238,119,0,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Verticale scheidingslijn midden */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: '1px',
        background: 'linear-gradient(to bottom, transparent, rgba(238,119,0,0.4) 25%, rgba(238,119,0,0.4) 75%, transparent)',
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
        gap: '12px',
      }}>
        <svg width="44" height="34" viewBox="0 0 40 32" fill="none">
          <path d="M2 26L9 8L16 19L20 4L24 19L31 8L38 26H2Z" fill="#EE7700" opacity="0.95"/>
          <rect x="2" y="27" width="36" height="3" rx="1.5" fill="#EE7700" opacity="0.75"/>
        </svg>
        <div style={{
          fontFamily: 'var(--font-barlow, sans-serif)',
          fontSize: '15px',
          fontWeight: 700,
          letterSpacing: '7px',
          color: '#f0ede6',
          opacity: 0.9,
          textShadow: '0 1px 20px rgba(0,0,0,0.9)',
        }}>
          SALES CANVAS
        </div>
      </div>

      {/* Rechts onderin: ROYAL DUTCH SALES */}
      <div style={{
        position: 'absolute',
        bottom: '36px',
        right: '48px',
        fontFamily: 'var(--font-barlow, sans-serif)',
        fontSize: '11px',
        letterSpacing: '5px',
        color: '#f0ede6',
        opacity: 0.2,
      }}>
        ROYAL DUTCH SALES
      </div>

      {/* Onderrand oranje lijn */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(to right, transparent, #EE7700 25%, #EE7700 75%, transparent)',
        opacity: 0.5,
      }} />

    </div>
  )
}
