// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ─── TYPES ────────────────────────────────────────────────────────────
type KpiId =
  | 'kpi_verkoopcyclus' | 'kpi_conversieratio' | 'kpi_klantaandeel'
  | 'kpi_klantretentie' | 'kpi_forecast' | 'kpi_ordergrootte'
  | 'kpi_nieuwe_logos' | 'kpi_omzet' | 'kpi_winst' | 'kpi_referrals'

interface KpiDef {
  id: KpiId
  label: string
  suffix?: string
  prefix?: string
  invert?: boolean   // lager = beter (verkoopcyclus)
  redBelow?: number  // % van doel
  greenAbove?: number
}

// ─── KPI CONFIG ───────────────────────────────────────────────────────
const KPIS: KpiDef[] = [
  { id: 'kpi_verkoopcyclus',  label: 'Verkoopcyclus',       suffix: ' dgn',  invert: true  },
  { id: 'kpi_conversieratio', label: '% Target behaald',    suffix: '%'                     },
  { id: 'kpi_klantaandeel',   label: '% Klantaandeel',      suffix: '%'                     },
  { id: 'kpi_klantretentie',  label: '% Klantretentie',     suffix: '%'                     },
  { id: 'kpi_forecast',       label: '% Behaalde Forecast', suffix: '%'                     },
  { id: 'kpi_ordergrootte',   label: '€ Gem. Ordergrootte', prefix: '€'                     },
  { id: 'kpi_nieuwe_logos',   label: "# Nieuwe Logo's"                                      },
  { id: 'kpi_omzet',          label: '€ Omzet',             prefix: '€'                     },
  { id: 'kpi_winst',          label: '€/% Winst'                                             },
  { id: 'kpi_referrals',      label: '# Referrals'                                          },
]

// ─── STIJL ────────────────────────────────────────────────────────────
const BEBAS: React.CSSProperties = {
  fontFamily: 'var(--font-bebas), sans-serif',
  letterSpacing: '3px',
  color: '#1a1714',
}
const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-space-mono, monospace)',
  color: '#1a1714',
}

// ─── HELPERS ──────────────────────────────────────────────────────────
function parse(s: string): number | null {
  if (!s) return null
  const n = parseFloat(s.replace(',', '.').replace(/[^0-9.\-]/g, ''))
  return isNaN(n) ? null : n
}

function fmt(val: number | null, def: KpiDef): string {
  if (val === null) return '—'
  const n = Math.round(val).toLocaleString('nl-NL')
  if (def.prefix) return `${def.prefix}${n}`
  if (def.suffix) return `${n}${def.suffix}`
  return String(n)
}

function trafficColor(doel: number | null, real: number | null, invert = false): string {
  if (doel === null || real === null || doel === 0) return '#888'
  const pct = (real / doel) * 100
  if (invert) {
    if (pct <= 90) return '#38a169'   // onder doel = goed
    if (pct <= 100) return '#dd8800'
    return '#e53e3e'
  }
  if (pct >= 100) return '#38a169'
  if (pct >= 75) return '#dd8800'
  return '#e53e3e'
}

function pctLabel(doel: number | null, real: number | null, invert = false): string {
  if (doel === null || real === null || doel === 0) return ''
  const pct = Math.round((real / doel) * 100)
  return `${pct}%`
}

// ─── COMPONENTS ───────────────────────────────────────────────────────

function TrafficDot({ color }: { color: string }) {
  return (
    <div style={{
      width: '14px', height: '14px', borderRadius: '50%',
      backgroundColor: color, flexShrink: 0,
      boxShadow: `0 0 8px ${color}99`,
    }} />
  )
}

function KpiCard({ def, doel, real }: { def: KpiDef; doel: string; real: string }) {
  const doelN = parse(doel)
  const realN = parse(real)
  const color = trafficColor(doelN, realN, def.invert)
  const pct = pctLabel(doelN, realN, def.invert)
  const hasData = doelN !== null || realN !== null

  return (
    <div style={{
      borderTop: '1px solid #e0d8cc',
      padding: '20px 0 16px',
    }}>
      {/* Label + dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <TrafficDot color={hasData ? color : '#ccc'} />
        <span style={{ ...MONO, fontSize: '13px', opacity: 0.55, letterSpacing: '1px', textTransform: 'uppercase' }}>
          {def.label}
        </span>
      </div>

      {/* Doel / Realisatie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '10px' }}>
        <div>
          <div style={{ ...MONO, fontSize: '11px', opacity: 0.35, letterSpacing: '2px', marginBottom: '4px' }}>DOEL</div>
          <div style={{ ...BEBAS, fontSize: '28px', opacity: doelN !== null ? 1 : 0.2 }}>
            {doelN !== null ? fmt(doelN, def) : '—'}
          </div>
        </div>
        <div>
          <div style={{ ...MONO, fontSize: '11px', opacity: 0.35, letterSpacing: '2px', marginBottom: '4px' }}>REALISATIE</div>
          <div style={{ ...BEBAS, fontSize: '28px', color: hasData ? color : '#1a1714', opacity: realN !== null ? 1 : 0.2 }}>
            {realN !== null ? fmt(realN, def) : '—'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {doelN !== null && realN !== null && doelN > 0 && (
        <div>
          <div style={{ height: '3px', backgroundColor: '#e0d8cc', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min((realN / doelN) * 100, 100)}%`,
              backgroundColor: color,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ ...MONO, fontSize: '11px', marginTop: '5px', color, letterSpacing: '1px' }}>
            {pct} van doel
          </div>
        </div>
      )}
    </div>
  )
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ ...MONO, fontSize: '13px', opacity: 0.55, letterSpacing: '1px' }}>{label}</span>
        <span style={{ ...MONO, fontSize: '13px', fontWeight: 700 }}>{Math.round(value).toLocaleString('nl-NL')}</span>
      </div>
      <div style={{ height: '6px', backgroundColor: '#e0d8cc', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '3px' }} />
      </div>
    </div>
  )
}

function ConversieStap({ from, to, pct, color }: { from: string; to: string; pct: number | null; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #e0d8cc' }}>
      <TrafficDot color={pct !== null ? color : '#ccc'} />
      <span style={{ ...MONO, fontSize: '13px', opacity: 0.55, flex: 1 }}>{from} → {to}</span>
      <span style={{ ...BEBAS, fontSize: '24px', color: pct !== null ? color : '#ccc' }}>
        {pct !== null ? `${Math.round(pct)}%` : '—'}
      </span>
    </div>
  )
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ borderTop: '3px solid #EE7700', padding: '20px 0', backgroundColor: '#faf7f2' }}>
      <div style={{ ...MONO, fontSize: '11px', opacity: 0.4, letterSpacing: '2px', marginBottom: '8px' }}>{label}</div>
      <div style={{ ...BEBAS, fontSize: '48px', color: color || '#1a1714', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ ...MONO, fontSize: '12px', opacity: 0.4, marginTop: '6px' }}>{sub}</div>}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────
export default function KpiDashboardPage() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const pathname = usePathname()

  const [targets, setTargets] = useState<Record<string, { doel: string; real: string }>>({})
  const [funnel, setFunnel] = useState({ leads: 0, bezoeken: 0, offertes: 0, orders: 0 })
  const [loading, setLoading] = useState(true)

  const navLink = (href: string, label: string) => (
    <Link href={href} style={{
      color: pathname === href ? '#EE7700' : '#1a1714',
      textDecoration: 'none',
      opacity: pathname === href ? 1 : 0.4,
    }}>
      {label}
    </Link>
  )

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data } = await supabase
        .from('canvas_answers')
        .select('question_id, answer')
        .eq('user_id', user.id)
        .like('question_id', 'uitvoering_%')

      if (data) {
        const t: Record<string, { doel: string; real: string }> = {}
        let leads = 0, bezoeken = 0, offertes = 0, orders = 0

        data.forEach(r => {
          const key = r.question_id.slice('uitvoering_'.length)

          // KPI targets: kpi_[naam]_doel / kpi_[naam]_real
          if (key.endsWith('_doel') || key.endsWith('_real')) {
            const type = key.endsWith('_doel') ? 'doel' : 'real'
            const base = key.slice(0, key.lastIndexOf('_'))
            if (!t[base]) t[base] = { doel: '', real: '' }
            t[base][type] = r.answer
          }

          // Funnel aantallen
          if (key === 'numbers_leads') leads = parseFloat(r.answer) || 0
          if (key === 'numbers_bezoeken') bezoeken = parseFloat(r.answer) || 0
          if (key === 'numbers_offertes') offertes = parseFloat(r.answer) || 0
          if (key === 'numbers_orders') orders = parseFloat(r.answer) || 0
        })

        setTargets(t)
        setFunnel({ leads, bezoeken, offertes, orders })
      }
      setLoading(false)
    })()
  }, [user])

  // Conversie percentages
  const conv1 = funnel.leads > 0 ? (funnel.bezoeken / funnel.leads) * 100 : null
  const conv2 = funnel.bezoeken > 0 ? (funnel.offertes / funnel.bezoeken) * 100 : null
  const conv3 = funnel.offertes > 0 ? (funnel.orders / funnel.offertes) * 100 : null

  const convColor = (v: number | null, red: number, green: number) =>
    v === null ? '#888' : v < red ? '#e53e3e' : v > green ? '#38a169' : '#dd8800'

  // Hoeveel KPIs groen/oranje/rood
  const statusCounts = { groen: 0, oranje: 0, rood: 0, leeg: 0 }
  KPIS.forEach(def => {
    const d = parse(targets[def.id]?.doel || '')
    const r = parse(targets[def.id]?.real || '')
    if (d === null || r === null) { statusCounts.leeg++; return }
    const color = trafficColor(d, r, def.invert)
    if (color === '#38a169') statusCounts.groen++
    else if (color === '#dd8800') statusCounts.oranje++
    else statusCounts.rood++
  })

  const funnelMax = Math.max(funnel.leads, funnel.bezoeken, funnel.offertes, funnel.orders, 1)

  if (!user) return (
    <div style={{ backgroundColor: '#f5f0e8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ ...MONO, opacity: 0.4 }}>Inloggen vereist</p>
    </div>
  )

  return (
    <main style={{ backgroundColor: '#f5f0e8', minHeight: '100vh', color: '#1a1714' }}>

      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '24px 48px',
        fontFamily: 'var(--font-bebas), sans-serif', fontSize: '36px', letterSpacing: '3px',
        borderBottom: '1px solid #e0d8cc',
        position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#f5f0e8',
      }}>
        {navLink('/', 'HOME')}
        <span style={{ opacity: 0.15 }}>·</span>
        {navLink('/arnobot', 'ARNOBOT')}
        <span style={{ opacity: 0.15 }}>·</span>
        {navLink('/bio', 'BIO')}
        <span style={{ opacity: 0.15 }}>·</span>
        {navLink('/blog', 'BLOG')}
        <span style={{ opacity: 0.15 }}>·</span>
        {navLink('/canvas', 'CANVAS')}
        <span style={{ opacity: 0.15 }}>·</span>
        {navLink('/subscribe', 'SUBSCRIBE')}
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: '13px', opacity: 0.25, fontFamily: 'var(--font-space-mono, monospace)', letterSpacing: '2px' }}>
          KPI DASHBOARD
        </span>
      </nav>

      {/* CANVAS SUBNAV */}
      <div style={{
        display: 'flex', gap: '32px', padding: '16px 48px',
        borderBottom: '1px solid #e0d8cc', backgroundColor: '#f5f0e8',
      }}>
        {[
          { href: '/canvas/strategie', label: 'STRATEGIE' },
          { href: '/canvas/mensen', label: 'MENSEN' },
          { href: '/canvas/uitvoering', label: 'UITVOERING' },
          { href: '/canvas/team', label: 'TEAM' },
          { href: '/canvas/kpi', label: 'KPI' },
        ].map(({ href, label }) => (
          <Link key={href} href={href} style={{
            fontFamily: 'var(--font-bebas), sans-serif', fontSize: '20px', letterSpacing: '3px',
            color: pathname === href ? '#EE7700' : '#1a1714',
            textDecoration: 'none', opacity: pathname === href ? 1 : 0.4,
          }}>
            {label}
          </Link>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '80px 48px', ...MONO, opacity: 0.3, letterSpacing: '3px', fontSize: '13px' }}>
          LADEN...
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div style={{ padding: '48px 48px 0' }}>
            <div style={{ ...BEBAS, fontSize: '64px', lineHeight: 1, marginBottom: '8px' }}>
              KPI DASHBOARD
            </div>
            <div style={{ ...MONO, fontSize: '14px', opacity: 0.4, letterSpacing: '1px' }}>
              Doelen vs. realisatie · Vul je KPI's in via{' '}
              <Link href="/canvas/uitvoering" style={{ color: '#EE7700', textDecoration: 'none' }}>
                UITVOERING
              </Link>
            </div>
          </div>

          {/* SAMENVATTING */}
          <div style={{ padding: '32px 48px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px' }}>
            <SummaryCard label="GROEN" value={String(statusCounts.groen)} sub="op of boven doel" color="#38a169" />
            <SummaryCard label="ORANJE" value={String(statusCounts.oranje)} sub="75–99% van doel" color="#dd8800" />
            <SummaryCard label="ROOD" value={String(statusCounts.rood)} sub="onder 75% van doel" color="#e53e3e" />
            <SummaryCard label="LEEG" value={String(statusCounts.leeg)} sub="nog niet ingevuld" />
          </div>

          {/* KPI GRID */}
          <div style={{ padding: '0 48px 48px', borderTop: '1px solid #e0d8cc', paddingTop: '40px' }}>
            <div style={{ ...BEBAS, fontSize: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              KPI METERS
              <span style={{ flex: 1, height: '1px', backgroundColor: '#e0d8cc' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0 48px' }}>
              {KPIS.map(def => (
                <KpiCard
                  key={def.id}
                  def={def}
                  doel={targets[def.id]?.doel || ''}
                  real={targets[def.id]?.real || ''}
                />
              ))}
            </div>
          </div>

          {/* SALES FUNNEL */}
          <div style={{ padding: '40px 48px 48px', borderTop: '1px solid #e0d8cc' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' }}>

              {/* Funnel bars */}
              <div>
                <div style={{ ...BEBAS, fontSize: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  SALES FUNNEL
                  <span style={{ flex: 1, height: '1px', backgroundColor: '#e0d8cc' }} />
                </div>
                <FunnelBar label="LEADS" value={funnel.leads} max={funnelMax} color="#EE7700" />
                <FunnelBar label="BEZOEKEN" value={funnel.bezoeken} max={funnelMax} color="#dd8800" />
                <FunnelBar label="OFFERTES" value={funnel.offertes} max={funnelMax} color="#e07000" />
                <FunnelBar label="ORDERS" value={funnel.orders} max={funnelMax} color="#c05800" />
              </div>

              {/* Conversie stappen */}
              <div>
                <div style={{ ...BEBAS, fontSize: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  CONVERSIES
                  <span style={{ flex: 1, height: '1px', backgroundColor: '#e0d8cc' }} />
                </div>
                <ConversieStap
                  from="Leads" to="Bezoeken"
                  pct={conv1}
                  color={convColor(conv1, 20, 40)}
                />
                <ConversieStap
                  from="Bezoeken" to="Offertes"
                  pct={conv2}
                  color={convColor(conv2, 30, 50)}
                />
                <ConversieStap
                  from="Offertes" to="Orders"
                  pct={conv3}
                  color={convColor(conv3, 30, 50)}
                />
                {conv1 !== null && conv2 !== null && conv3 !== null && (
                  <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#faf7f2', borderLeft: '3px solid #EE7700' }}>
                    <div style={{ ...MONO, fontSize: '11px', opacity: 0.4, letterSpacing: '2px', marginBottom: '6px' }}>TOTALE CONVERSIE</div>
                    <div style={{ ...BEBAS, fontSize: '40px', color: '#EE7700' }}>
                      {((funnel.orders / Math.max(funnel.leads, 1)) * 100).toFixed(1)}%
                    </div>
                    <div style={{ ...MONO, fontSize: '11px', opacity: 0.4, marginTop: '4px' }}>
                      van lead naar order
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LINK NAAR UITVOERING */}
          <div style={{ padding: '0 48px 80px', borderTop: '1px solid #e0d8cc', paddingTop: '40px', textAlign: 'center' }}>
            <div style={{ ...MONO, fontSize: '13px', opacity: 0.4, marginBottom: '16px', letterSpacing: '1px' }}>
              KPI's aanpassen? Ga naar het uitvoering canvas.
            </div>
            <Link href="/canvas/uitvoering" style={{
              ...BEBAS, fontSize: '18px', color: '#EE7700', textDecoration: 'none',
              border: '1px solid #EE7700', padding: '10px 32px', letterSpacing: '3px',
              display: 'inline-block',
            }}>
              → UITVOERING
            </Link>
          </div>
        </>
      )}
    </main>
  )
}
