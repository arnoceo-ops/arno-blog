'use client'

// PageHero.tsx
// Locatie: components/canvas/PageHero.tsx

interface PageHeroProps {
  number: number
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
      height: '855px',
      minHeight: '855px',
      overflow: 'hidden',
      backgroundColor: '#1c1a17',
      display: 'block',
    }}>

      {/* Achtergrond foto — volledig zichtbaar */}
      <img
        src={config.image}
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          filter: 'grayscale(10%) brightness(0.85)',
          display: 'block',
        }}
      />

      {/* Donkere overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(10,8,6,0.35) 0%, rgba(10,8,6,0.10) 50%, rgba(10,8,6,0.25) 100%)',
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
