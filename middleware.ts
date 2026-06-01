import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/canvas-aanmelden(.*)',
  '/api/canvas/aanmelden(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname
  if (!isPublicRoute(req) && path.startsWith('/canvas')) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\.|api/cron|bot/admin).*)'],
}