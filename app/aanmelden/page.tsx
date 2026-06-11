'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AanmeldenInner() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const ref = params.get('ref')
    if (ref) localStorage.setItem('arnobot_referral', ref)
    router.replace('/sign-in')
  }, [router, params])

  return (
    <div style={{ background: '#111827', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'monospace', color: '#f59e0b', fontSize: 13, letterSpacing: 4 }}>EVEN DOORVERWIJZEN...</p>
    </div>
  )
}

export default function AanmeldenPage() {
  return (
    <Suspense>
      <AanmeldenInner />
    </Suspense>
  )
}
