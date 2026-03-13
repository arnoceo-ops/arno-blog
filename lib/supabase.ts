import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'
import { useRef } from 'react'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ─── ADMIN (server-side alleen) ───────────────────────────────────────
let _adminClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createClient<Database>(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}

// ─── CLIENT HOOK — gebruikt Clerk JWT via accessToken callback ────────
export function useSupabaseClient() {
  const { getToken } = useAuth()
  const getTokenRef = useRef(getToken)
  getTokenRef.current = getToken

  const clientRef = useRef<ReturnType<typeof createClient<Database>> | null>(null)

  if (!clientRef.current) {
    clientRef.current = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      accessToken: async () => {
        const token = await getTokenRef.current({ template: 'supabase' })
        return token ?? ''
      },
    })
  }

  return clientRef.current
}

// ─── SERVER CLIENT ────────────────────────────────────────────────────
export async function createSupabaseServerClient(
  getToken: (options?: { template?: string }) => Promise<string | null>
) {
  const token = await getToken({ template: 'supabase' })

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => token ?? '',
  })
}
