import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'
import { useRef } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

let _adminClient: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}

// Client Components — stabiele instantie per component mount via useRef
export function useSupabaseClient() {
  const { getToken } = useAuth()
  const clientRef = useRef<ReturnType<typeof createClient> | null>(null)

  if (!clientRef.current) {
    clientRef.current = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url, options = {}) => {
          const token = await getToken({ template: 'supabase' })
          return fetch(url, {
            ...options,
            headers: {
              ...((options as RequestInit).headers ?? {}),
              Authorization: `Bearer ${token}`,
            },
          })
        },
      },
    })
  }

  return clientRef.current
}

// Server Components / API routes met Clerk auth context
export async function createSupabaseServerClient(
  getToken: (options?: { template?: string }) => Promise<string | null>
) {
  const token = await getToken({ template: 'supabase' })

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token ?? ''}`,
      },
    },
  })
}
