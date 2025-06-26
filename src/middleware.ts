import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const isLoggedIn = !!req.nextauth.token

    const isApiRoute = pathname.startsWith('/api')
    const isRoot = pathname === '/'

    if (isApiRoute) {
      return NextResponse.next()
    }

    if (!isLoggedIn) {
      if (isRoot) {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (isLoggedIn && isRoot) {
      return NextResponse.redirect(new URL('/utils', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
)
