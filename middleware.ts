import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/canvas-aanmelden(.*)',
  '/api/canvas/aanmelden(.*)',
  '/bot-aanmelden(.*)',
])

const isProtectedBot = createRouteMatcher(['/bot', '/bot/profiel'])

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname

  if (!isPublicRoute(req) && path.startsWith('/canvas')) {
    await auth.protect()
  }

  if (isProtectedBot(req)) {
    await auth.protect()
    const { userId } = await auth()
    if (!userId) return NextResponse.next()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: user, error } = await supabase
      .from('approved_users')
      .select('is_active, paid_at, expires_at, trial_start')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Middleware Supabase error:', error.message, '| userId:', userId)
    }

    if (!user || user.is_active === false) {
      return NextResponse.redirect(new URL('/bot-aanmelden', req.url))
    }

    let toegestaan = false
    if (user.paid_at) {
      toegestaan = true
    } else if (user.expires_at) {
      const exp = new Date(user.expires_at)
      if (!isNaN(exp.getTime()) && exp > new Date()) toegestaan = true
    } else if (user.trial_start) {
      const trialStart = new Date(user.trial_start)
      const trialEnd = new Date(trialStart.getTime() + 30 * 24 * 60 * 60 * 1000)
      if (new Date() < trialEnd) toegestaan = true
    }

    if (!toegestaan) {
      return NextResponse.redirect(new URL('/bot-aanmelden', req.url))
    }
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\.|api/cron|bot/admin).*)'],
}
