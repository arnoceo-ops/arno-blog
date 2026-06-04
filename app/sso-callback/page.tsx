'use client'

import { useClerk } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk()
  const router = useRouter()

  useEffect(() => {
    handleRedirectCallback({}).then(() => {
      window.location.replace('/bot')
    }).catch(() => {
      router.push('/sign-in')
    })
  }, [handleRedirectCallback, router])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' }}>
      <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, color: '#888' }}>EVEN WACHTEN...</p>
    </div>
  )
}
