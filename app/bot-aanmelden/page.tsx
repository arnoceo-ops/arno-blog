import Link from 'next/link'

export default function BotAanmeldenPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #f0ede6; font-family: 'Space Mono', monospace; }
      `}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 40px', display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3 }}>HOME</Link>
          <span style={{ color: '#EE7700', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3 }}>BOT</span>
        </div>
      </nav>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ maxWidth: 560, width: '100%' }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 6, color: '#EE7700', marginBottom: 12 }}>ARNOBOT UNLIMITED</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: '#f0ede6', lineHeight: 1.0, letterSpacing: 1, marginBottom: 32 }}>
            Dit is een<br />betaalde dienst.
          </h1>
          <div style={{ borderLeft: '4px solid #EE7700', paddingLeft: 20, marginBottom: 40 }}>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: '#888' }}>
              ArnoBot Unlimited geeft je onbeperkt toegang tot 20 jaar saleskennis van Arno Diepeveen — direct, ongefilterd, afgestemd op jouw situatie.
            </p>
          </div>
          <a
            href="https://www.royaldutchsales.com/arnobot"
            style={{ display: 'inline-block', background: '#EE7700', color: '#0a0a0a', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, padding: '14px 36px', borderRadius: 999, textDecoration: 'none' }}
          >
            BEKIJK ABONNEMENTEN →
          </a>
        </div>
      </div>
    </>
  )
}
