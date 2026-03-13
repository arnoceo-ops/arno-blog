import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'
import { useRef } from 'react'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

// Client Components — stabiele client, maar getToken altijd vers via ref
export function useSupabaseClient() {
  const { getToken } = useAuth()

  // Sla getToken op in een ref zodat de client niet opnieuw aangemaakt hoeft
  // te worden, maar toch altijd de laatste token gebruikt
  const getTokenRef = useRef(getToken)
  getTokenRef.current = getToken

  const clientRef = useRef<ReturnType<typeof createClient<Database>> | null>(null)

  if (!clientRef.current) {
    clientRef.current = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url, options = {}) => {
          const token = await getTokenRef.current({ template: 'supabase' })
          return fetch(url, {
            ...options,
            headers: {
              ...((options as RequestInit).headers ?? {}),
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          })
        },
      },
    })
  }

  return clientRef.current
}

export async function createSupabaseServerClient(
  getToken: (options?: { template?: string }) => Promise<string | null>
) {
  const token = await getToken({ template: 'supabase' })

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token ?? ''}`,
      },
    },
  })
}
