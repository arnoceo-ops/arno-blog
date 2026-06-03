'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useIsMobile } from '@/hooks/useBreakpoint'

interface Props {
  active: 'bot' | 'archief' | 'coaching' | 'account'
}

const navStyle = {
  position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 100,
  padding: '0 40px', height: 64,
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)',
}

const linkBase: React.CSSProperties = {
  color: '#888', textDecoration: 'none',
  fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3,
}

export default function BotNav({ active }: Props) {
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = useState(false)

  const items: { href: string; label: string; key: Props['active'] }[] = [
    { href: '/', label: 'HOME', key: 'bot' },
    { href: '/bot', label: 'BOT', key: 'bot' },
    { href: '/bot/geschiedenis', label: 'ARCHIEF', key: 'archief' },
    { href: '/bot/coaching', label: 'COACHING', key: 'coaching' },
    { href: '/bot/account', label: 'ACCOUNT', key: 'account' },
  ]

  if (isMobile === null) return null

  if (isMobile) {
    return (
      <>
        <style>{`
          .mob-nav { position:fixed;top:0;left:0;right:0;z-index:100;height:56px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(10,10,10,0.97);backdrop-filter:blur(12px); }
          .mob-nav-logo { font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;color:#f0ede6;text-decoration:none; }
          .mob-nav-logo span { color:#EE7700; }
          .mob-hamburger { background:none;border:none;cursor:pointer;display:flex;flex-direction:column;gap:5px;padding:8px; }
          .mob-hamburger span { display:block;width:22px;height:2px;background:#f0ede6; }
          .mob-menu { position:fixed;top:56px;left:0;right:0;z-index:99;background:#0a0a0a;border-bottom:1px solid rgba(255,255,255,0.06);padding:24px 20px;display:flex;flex-direction:column;gap:20px; }
          .mob-menu a,.mob-menu span { font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:3px;text-decoration:none; }
          .mob-menu a { color:#888; }
          .mob-menu a:hover { color:#f0ede6; }
          .mob-menu .mob-active { color:#EE7700; }
        `}</style>
        <nav className="mob-nav">
          <Link href="/bot" className="mob-nav-logo">ARNO<span>BOT.</span></Link>
          <button className="mob-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen
              ? <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#EE7700', lineHeight: 1 }}>✕</span>
              : <><span /><span /><span /></>
            }
          </button>
        </nav>
        {menuOpen && (
          <div className="mob-menu" onClick={() => setMenuOpen(false)}>
            <Link href="/">HOME</Link>
            {active === 'bot'      ? <span className="mob-active">BOT</span>      : <Link href="/bot">BOT</Link>}
            {active === 'archief'  ? <span className="mob-active">ARCHIEF</span>  : <Link href="/bot/geschiedenis">ARCHIEF</Link>}
            {active === 'coaching' ? <span className="mob-active">COACHING</span> : <Link href="/bot/coaching">COACHING</Link>}
            {active === 'account'  ? <span className="mob-active">ACCOUNT</span>  : <Link href="/bot/account">ACCOUNT</Link>}
          </div>
        )}
      </>
    )
  }

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
        <Link href="/" style={linkBase}>HOME</Link>
        {active === 'bot'
          ? <span style={{ ...linkBase, color: '#EE7700' }}>BOT</span>
          : <Link href="/bot" style={linkBase}>BOT</Link>}
        {active === 'archief'
          ? <span style={{ ...linkBase, color: '#EE7700' }}>ARCHIEF</span>
          : <Link href="/bot/geschiedenis" style={linkBase}>ARCHIEF</Link>}
        {active === 'coaching'
          ? <span style={{ ...linkBase, color: '#EE7700' }}>COACHING</span>
          : <Link href="/bot/coaching" style={linkBase}>COACHING</Link>}
        {active === 'account'
          ? <span style={{ ...linkBase, color: '#EE7700' }}>ACCOUNT</span>
          : <Link href="/bot/account" style={linkBase}>ACCOUNT</Link>}
      </div>
    </nav>
  )
}
