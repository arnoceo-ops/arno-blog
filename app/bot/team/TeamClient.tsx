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
    const link = `${window.location.origin}/bot/team/join?code=${team.invite_code}`
    navigator.clipboard.writeText(link)
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
          background: #111; color: #f0ede6; border: 1.5px solid #333;
          border-radius: 4px; font-family: 'Space Mono', monospace;
          font-size: 15px; font-weight: 400;
          padding: 12px 16px; width: 100%; outline: none;
          box-sizing: border-box; transition: border-color 0.15s;
        }
        .team-input:focus { border-color: #EE7700; }
        .team-input::placeholder { color: #444; }
      `}</style>

      <BotNav active="team" />

      <div style={{ minHeight: '100vh', background: '#0a0a0a', paddingTop: 64 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(48px,5vw,80px) clamp(20px,4vw,48px)' }}>

          {loading && (
            <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, color: '#555', fontSize: 13, letterSpacing: 2 }}>LADEN...</p>
          )}

          {!loading && !hasTeam && (
            <>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 4, color: '#EE7700', marginBottom: 8 }}>ARNOBOT</p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(48px,7vw,80px)', color: '#f0ede6', letterSpacing: -1, lineHeight: 0.95, marginBottom: 48 }}>
                START JE<br />TEAM.
              </h1>
              <div style={{ maxWidth: 480 }}>
                <label style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 13, letterSpacing: 4, color: '#EE7700', display: 'block', marginBottom: 8 }}>TEAMNAAM</label>
                <input
                  type="text"
                  className="team-input"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createTeam()}
                  placeholder="bijv. Sales Team Noord"
                  style={{ marginBottom: 16 }}
                />
                {createError && <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 13, color: '#ff4444', marginBottom: 12 }}>{createError}</p>}
                <button
                  onClick={createTeam}
                  disabled={creating || !teamName.trim()}
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, padding: '16px 48px', background: creating || !teamName.trim() ? '#1a1a1a' : '#EE7700', color: creating || !teamName.trim() ? '#333' : '#0a0a0a', border: 'none', borderRadius: 999, cursor: creating ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
                >
                  {creating ? 'AANMAKEN...' : 'TEAM AANMAKEN'}
                </button>
              </div>
            </>
          )}

          {!loading && hasTeam && isManager && team && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 48, borderBottom: '3px solid #EE7700', paddingBottom: 32 }}>
                <div>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 4, color: '#EE7700', marginBottom: 4 }}>TEAM</p>
                  <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px,6vw,72px)', color: '#f0ede6', letterSpacing: -1, lineHeight: 0.95 }}>
                    {team.name.toUpperCase()}
                  </h1>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 11, letterSpacing: 2, color: '#555' }}>UITNODIGINGSLINK</p>
                  <button
                    onClick={copyInviteLink}
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 18, letterSpacing: 3, padding: '12px 28px', background: 'none', border: '1px solid #EE7700', color: '#EE7700', borderRadius: 999, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {copied ? 'GEKOPIEERD!' : 'KOPIEER LINK'}
                  </button>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 10, color: '#444' }}>code: {team.invite_code}</p>
                </div>
              </div>

              <div style={{ marginBottom: 64 }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, color: '#f0ede6', marginBottom: 20 }}>
                  TEAMLEDEN <span style={{ color: '#555' }}>({members.length})</span>
                </p>

                {members.length === 0 ? (
                  <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 13, color: '#555', lineHeight: 2 }}>
                    Nog geen teamleden. Stuur de uitnodigingslink naar je team.
                  </p>
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
                            <td style={{ padding: '16px 16px 16px 0', fontWeight: 400, fontSize: 13, color: '#f0ede6' }}>{m.name}</td>
                            <td style={{ padding: '16px 16px 16px 0', fontWeight: 400, fontSize: 11, letterSpacing: 2, color: m.role === 'manager' ? '#EE7700' : '#555' }}>
                              {m.role === 'manager' ? 'MANAGER' : 'LID'}
                            </td>
                            <td style={{ padding: '16px 16px 16px 0', fontWeight: 400, fontSize: 13, color: m.sessions > 0 ? '#f0ede6' : '#444' }}>{m.sessions}</td>
                            <td style={{ padding: '16px 16px 16px 0', fontWeight: 400, fontSize: 13, color: '#888' }}>{formatLast(m.last_activity)}</td>
                            <td style={{ padding: '16px 0', fontWeight: 400, fontSize: 13, color: m.analyses > 0 ? '#f0ede6' : '#444' }}>{m.analyses}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 48 }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 4, color: '#EE7700', marginBottom: 4 }}>COLLECTIEVE ANALYSE</p>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px,4vw,52px)', color: '#f0ede6', letterSpacing: -0.5, marginBottom: 16 }}>TEAM SPOTLIGHT</h2>
                <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 13, color: '#888', lineHeight: 1.8, marginBottom: 24 }}>
                  Arno analyseert de collectieve gesprekken van je team: gemeenschappelijke blinde vlekken, patronen en sterktes.
                </p>
                <button
                  onClick={generateSpotlight}
                  disabled={spotlightLoading || members.length < 2}
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, padding: '16px 48px', background: spotlightLoading || members.length < 2 ? '#1a1a1a' : '#EE7700', color: spotlightLoading || members.length < 2 ? '#333' : '#0a0a0a', border: 'none', borderRadius: 999, cursor: spotlightLoading || members.length < 2 ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginBottom: 24 }}
                >
                  {spotlightLoading ? 'ARNO ANALYSEERT...' : 'GENEREER TEAM-ANALYSE'}
                </button>
                {members.length < 2 && (
                  <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 11, color: '#555', letterSpacing: 1 }}>Minimaal 2 teamleden nodig voor een team-analyse.</p>
                )}
                {spotlight && (
                  <div style={{ background: '#111', border: '1px solid #1a1a1a', padding: '28px 32px', marginTop: 8 }}>
                    <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: 14, color: '#f0ede6', lineHeight: 2, whiteSpace: 'pre-wrap' }}>{spotlight}</p>
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
