'use client'

import { useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BotNav from '../BotNav'

export default function AccountPage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const [exporting, setExporting] = useState(false)
  const [exportDone, setExportDone] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isLoaded) return null

  const name = user?.fullName || '—'
  const email = user?.primaryEmailAddress?.emailAddress || '—'

  async function handleExport() {
    setExporting(true)
    setExportDone(false)
    setError(null)
    try {
      const res = await fetch('/api/bot/export')
      if (!res.ok) throw new Error('Export mislukt')
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `arnobot-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExportDone(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Export mislukt')
    } finally {
      setExporting(false)
    }
  }

  async function handleDelete() {
    if (deleteInput !== 'VERWIJDER') return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch('/api/bot/delete-account', { method: 'DELETE' })
      if (!res.ok) throw new Error('Verwijdering mislukt')
      await signOut()
      router.push('/')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verwijdering mislukt')
      setDeleting(false)
    }
  }

  const section: React.CSSProperties = { borderTop: '1px solid #1e1e1e', paddingTop: '32px', marginBottom: '48px' }
  const label: React.CSSProperties = { color: '#EE7700', fontSize: '13px', letterSpacing: '4px', marginBottom: '8px' }
  const body: React.CSSProperties = { color: '#f0ede6', opacity: 0.5, fontSize: '15px', lineHeight: '1.8', maxWidth: 480, marginBottom: '24px' }
  const btn: React.CSSProperties = { padding: '12px 28px', border: 'none', fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '3px', cursor: 'pointer', transition: 'all 0.2s' }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #f0ede6; font-family: 'Space Mono', monospace; }
        input { background: #111; border: 1px solid #333; color: #f0ede6; font-family: 'Space Mono', monospace; font-size: 15px; letter-spacing: 2px; padding: 12px 16px; outline: none; width: 100%; }
        input:focus { border-color: #EE7700; }
      `}</style>

      <BotNav active="account" />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '120px 48px 80px' }}>

        <p style={{ color: '#EE7700', fontSize: 13, letterSpacing: 4, marginBottom: 8 }}>ACCOUNT</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 3, margin: '0 0 48px 0', lineHeight: 1 }}>JOUW GEGEVENS</h1>

        {/* Privacy statement */}
        <div style={{ background: '#111', borderLeft: '4px solid #EE7700', padding: '20px 24px', marginBottom: 48 }}>
          <p style={{ fontSize: 13, letterSpacing: 3, color: '#EE7700', marginBottom: 8, fontFamily: "'Bebas Neue', sans-serif" }}>JOUW DATA IS VAN JOU</p>
          <p style={{ fontSize: 15, lineHeight: '28px', color: '#888' }}>
            Alles wat je hier invoert en bespreekt met ArnoBot, is 100% veilig opgeslagen en wordt nooit gedeeld met derden, gebruikt voor marketing of ingezet voor andere doeleinden dan jouw persoonlijke coaching. Je kunt je gegevens op elk moment downloaden of je account volledig verwijderen.
          </p>
        </div>

        {/* Accountinformatie */}
        <div style={section}>
          <p style={label}>ACCOUNTINFORMATIE</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ color: '#f0ede6', opacity: 0.4, fontSize: 13, letterSpacing: 2, marginBottom: 4 }}>NAAM</p>
              <p style={{ fontSize: 16 }}>{name}</p>
            </div>
            <div>
              <p style={{ color: '#f0ede6', opacity: 0.4, fontSize: 13, letterSpacing: 2, marginBottom: 4 }}>E-MAILADRES</p>
              <p style={{ fontSize: 16 }}>{email}</p>
            </div>
          </div>
        </div>

        {/* Profiel */}
        <div style={section}>
          <p style={label}>ARNOBOT PROFIEL</p>
          <p style={body}>Pas je profiel aan zodat ArnoBot beter op jou is afgestemd.</p>
          <Link href="/bot/profiel" style={{ ...btn, background: '#f0ede6', color: '#0a0a0a', textDecoration: 'none', display: 'inline-block' }}>
            PROFIEL AANPASSEN
          </Link>
        </div>

        {/* Data export */}
        <div style={section}>
          <p style={label}>JOUW DATA</p>
          <p style={body}>Download een volledig overzicht van alle gegevens die ArnoBot over jou heeft opgeslagen. Je ontvangt een JSON-bestand.</p>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{ ...btn, background: exporting ? '#1a1a1a' : '#f0ede6', color: exporting ? '#444' : '#0a0a0a', cursor: exporting ? 'not-allowed' : 'pointer' }}
          >
            {exporting ? 'EXPORTEREN...' : 'DOWNLOAD MIJN DATA'}
          </button>
          {exportDone && <p style={{ color: '#EE7700', fontSize: 13, letterSpacing: 2, marginTop: 12 }}>✓ Download gestart</p>}
        </div>

        {/* Account verwijderen */}
        <div style={{ ...section, marginBottom: 0 }}>
          <p style={{ ...label, color: '#cc2200' }}>ACCOUNT VERWIJDEREN</p>
          <p style={body}>Hiermee worden al jouw gegevens permanent verwijderd uit Royal Dutch Sales. Dit is niet ongedaan te maken.</p>

          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              style={{ ...btn, background: 'transparent', color: '#cc2200', border: '1px solid #cc2200' }}
            >
              ACCOUNT VERWIJDEREN
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
              <p style={{ color: '#f0ede6', opacity: 0.7, fontSize: 14, letterSpacing: 1, lineHeight: 1.6 }}>
                Typ <strong>VERWIJDER</strong> om te bevestigen:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="VERWIJDER"
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleDelete}
                  disabled={deleteInput !== 'VERWIJDER' || deleting}
                  style={{ ...btn, background: deleteInput === 'VERWIJDER' && !deleting ? '#cc2200' : '#1a1a1a', color: deleteInput === 'VERWIJDER' && !deleting ? '#fff' : '#444', cursor: deleteInput === 'VERWIJDER' && !deleting ? 'pointer' : 'not-allowed' }}
                >
                  {deleting ? 'VERWIJDEREN...' : 'BEVESTIG VERWIJDERING'}
                </button>
                <button
                  onClick={() => { setDeleteConfirm(false); setDeleteInput('') }}
                  style={{ ...btn, background: 'transparent', color: '#f0ede6', border: '1px solid #333', opacity: 0.5 }}
                >
                  ANNULEREN
                </button>
              </div>
            </div>
          )}
        </div>

        {error && <p style={{ color: '#cc2200', fontSize: 14, letterSpacing: 1, marginTop: 24 }}>✗ {error}</p>}

      </div>
    </>
  )
}
