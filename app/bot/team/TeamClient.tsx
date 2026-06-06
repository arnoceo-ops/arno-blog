'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BotNav from '@/app/bot/BotNav'

function formatLast(iso: string | null) {
  if (!iso) return 'Nog niet actief'
  const d = new Date(iso)
  const diff = Math.round((Date.now() - d.getTime()) / 86400000)
  if (diff === 0) return 'Vandaag'
  if (diff === 1) return 'Gisteren'
  if (diff < 7) return `${diff} dagen geleden`
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

interface Member {
  user_id: string
  name: string
  role: string
  sessions: number
  last_activity: string | null
  analyses: number
}

interface Team {
  id: string
  name: string
  invite_code: string
}

const label: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace", fontWeight: 400,
  fontSize: 13, letterSpacing: 4, color: '#EE7700',
  display: 'block', marginBottom: 16,
}

const body: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace", fontWeight: 400,
  fontSize: 15, color: '#888', lineHeight: '1.9', marginBottom: 24,
}

const section: React.CSSProperties = {
  borderTop: '1px solid #1a1a1a', paddingTop: 32, marginBottom: 48,
}

const btnPrimary = (disabled: boolean): React.CSSProperties => ({
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: 22, letterSpacing: 3,
  padding: '16px 48px',
  background: disabled ? '#1a1a1a' : '#EE7700',
  color: disabled ? '#333' : '#0a0a0a',
  border: 'none', borderRadius: 999,
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'background 0.2s',
})

const btnOutline: React.CSSProperties = {
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: 18, letterSpacing: 3,
  padding: '12px 28px',
  background: 'none', border: '1px solid #555',
  color: '#888', borderRadius: 999,
  cursor: 'pointer', transition: 'all 0.2s',
}

export default function TeamClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isManager, setIsManager] = useState(false)
  const [hasTeam, setHasTeam] = useState(false)
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [teamName, setTeamName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [copied, setCopied] = useState(false)
  const [spotlight, setSpotlight] = useState('')
  const [spotlightLoading, setSpotlightLoading] = useState(false)

  useEffect(() => {
    fetch('/api/bot/team/status')
      .then(r => r.json())
      .then(data => {
        setHasTeam(data.hasTeam)
        setIsManager(data.isManager)
        if (data.isManager && data.hasTeam) {
          setTeam(data.team)
          loadDashboard()
        } else if (data.hasTeam && !data.isManager) {
          router.replace('/bot')
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [])

  function loadDashboard() {
    fetch('/api/bot/team/dashboard')
      .then(r => r.json())
      .then(data => {
        if (data.team) setTeam(data.team)
        setMembers(data.members ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  async function createTeam() {
    if (!teamName.trim()) return
    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch('/api/bot/team/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.error || 'Mislukt'); return }
      setTeam(data.team)
      setHasTeam(true)
      setIsManager(true)
      setMembers([])
      loadDashboard()
    } catch {
      setCreateError('Er ging iets mis')
    } finally {
      setCreating(false)
    }
  }

  async function generateSpotlight() {
    setSpotlightLoading(true)
    setSpotlight('')
    try {
      const res = await fetch('/api/bot/team/spotlight', { method: 'POST' })
      const data = await res.json()
      if (data.analyse) setSpotlight(data.analyse)
      else setSpotlight(data.error || 'Niet genoeg data beschikbaar.')
    } catch {
      setSpotlight('Er ging iets mis.')
    } finally {
      setSpotlightLoading(false)
    }
  }

  function copyInviteLink() {
    if (!team) return
    navigator.clipboard.writeText(`${window.location.origin}/bot/team/join?code=${team.invite_code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #f0ede6; font-family: 'Space Mono', monospace; font-weight: 400; }
        .team-input {
          background: #111; color: #f0ede6; border: 1.5px solid #333; border-radius: 4px;
          font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 400;
          padding: 12px 16px; width: 100%; outline: none;
          box-sizing: border-box; transition: border-color 0.15s; line-height: 1.9;
        }
        .team-input:focus { border-color: #EE7700; }
        .team-input::placeholder { color: #444; }
        .btn-outline:hover { border-color: #EE7700 !important; color: #EE7700 !important; }
      `}</style>

      <BotNav active="team" />

      <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '120px 48px 80px' }}>

          {loading && (
            <p style={{ ...body, color: '#555', letterSpacing: 2 }}>LADEN...</p>
          )}

          {/* Team aanmaken */}
          {!loading && !hasTeam && (
            <>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 4, color: '#EE7700', marginBottom: 8 }}>ARNOBOT</p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, color: '#f0ede6', lineHeight: 1, margin: '0 0 48px 0' }}>
                START JE TEAM.
              </h1>

              <div style={{ background: '#111', borderLeft: '4px solid #EE7700', padding: '20px 24px', marginBottom: 48 }}>
                <p style={{ ...body, color: '#888', marginBottom: 0 }}>
                  Maak een team aan en nodig je salesteam uit via een persoonlijke link. Als manager zie je de voortgang en collectieve patronen van je hele team.
                </p>
              </div>

              <div style={{ maxWidth: 480 }}>
                <span style={label}>TEAMNAAM</span>
                <input
                  type="text"
                  className="team-input"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createTeam()}
                  placeholder="bijv. Sales Team Noord"
                  style={{ marginBottom: 16 }}
                />
                {createError && <p style={{ ...body, color: '#ff4444', marginBottom: 12 }}>{createError}</p>}
                <button onClick={createTeam} disabled={creating || !teamName.trim()} style={btnPrimary(creating || !teamName.trim())}>
                  {creating ? 'AANMAKEN...' : 'TEAM AANMAKEN'}
                </button>
              </div>
            </>
          )}

          {/* Dashboard */}
          {!loading && hasTeam && isManager && team && (
            <>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 4, color: '#EE7700', marginBottom: 8 }}>TEAM</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 48, borderBottom: '3px solid #EE7700', paddingBottom: 32 }}>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, color: '#f0ede6', lineHeight: 1, margin: 0 }}>
                  {team.name.toUpperCase()}
                </h1>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button className="btn-outline" onClick={copyInviteLink} style={{ ...btnOutline, color: copied ? '#EE7700' : '#888', borderColor: copied ? '#EE7700' : '#555' }}>
                    {copied ? 'GEKOPIEERD!' : 'KOPIEER UITNODIGINGSLINK'}
                  </button>
                </div>
              </div>

              <div style={section}>
                <span style={label}>TEAMLEDEN ({members.length})</span>
                {members.length === 0 ? (
                  <p style={body}>Nog geen teamleden. Stuur de uitnodigingslink naar je team.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Space Mono', monospace", fontWeight: 400 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                          {['NAAM', 'ROL', 'GESPREKKEN', 'LAATSTE ACTIVITEIT', 'ANALYSES'].map(h => (
                            <th key={h} style={{ textAlign: 'left', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 13, letterSpacing: 2, color: '#555', padding: '8px 16px 12px 0' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {members.map(m => (
                          <tr key={m.user_id} style={{ borderBottom: '1px solid #111' }}>
                            <td style={{ padding: '16px 16px 16px 0', fontWeight: 400, fontSize: 15, color: '#f0ede6' }}>{m.name}</td>
                            <td style={{ padding: '16px 16px 16px 0', fontWeight: 400, fontSize: 13, letterSpacing: 2, color: m.role === 'manager' ? '#EE7700' : '#555' }}>
                              {m.role === 'manager' ? 'MANAGER' : 'LID'}
                            </td>
                            <td style={{ padding: '16px 16px 16px 0', fontWeight: 400, fontSize: 15, color: m.sessions > 0 ? '#f0ede6' : '#444' }}>{m.sessions}</td>
                            <td style={{ padding: '16px 16px 16px 0', fontWeight: 400, fontSize: 15, color: '#888' }}>{formatLast(m.last_activity)}</td>
                            <td style={{ padding: '16px 0', fontWeight: 400, fontSize: 15, color: m.analyses > 0 ? '#f0ede6' : '#444' }}>{m.analyses}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div style={section}>
                <span style={label}>COLLECTIEVE ANALYSE</span>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 3, color: '#f0ede6', lineHeight: 1, margin: '0 0 16px 0' }}>TEAM SPOTLIGHT</h2>
                <p style={body}>
                  Arno analyseert de collectieve gesprekken van je team: gemeenschappelijke blinde vlekken, patronen en sterktes.
                </p>
                <button
                  onClick={generateSpotlight}
                  disabled={spotlightLoading || members.length < 2}
                  style={{ ...btnPrimary(spotlightLoading || members.length < 2), marginBottom: 16 }}
                >
                  {spotlightLoading ? 'ARNO ANALYSEERT...' : 'GENEREER TEAM-ANALYSE'}
                </button>
                {members.length < 2 && (
                  <p style={{ ...body, fontSize: 13, color: '#555', marginBottom: 0 }}>Minimaal 2 teamleden nodig voor een team-analyse.</p>
                )}
                {spotlight && (
                  <div style={{ background: '#111', borderLeft: '4px solid #EE7700', padding: '24px 28px', marginTop: 16 }}>
                    <p style={{ ...body, color: '#f0ede6', marginBottom: 0, whiteSpace: 'pre-wrap' }}>{spotlight}</p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}
