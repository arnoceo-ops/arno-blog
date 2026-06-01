import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/canvas-aanmelden(.*)',
  '/api/canvas/aanmelden(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req) && req.nextUrl.pathname.startsWith('/canvas')) {
    await auth.protect()
  }
  if (req.nextUrl.pathname.startsWith('/blog')) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\.|api/cron|spar).*)'],
}