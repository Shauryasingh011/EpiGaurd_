import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * DEPRECATED: NextAuth is no longer used.
 * Authentication is now handled by Firebase Authentication.
 * Please use the /sign-in or /sign-up pages instead.
 */

export function GET() {
  return NextResponse.json(
    {
      error: 'NextAuth is deprecated. Use Firebase Authentication instead.',
      redirectTo: '/sign-in',
    },
    { status: 410 },
  )
}

export function POST() {
  return NextResponse.json(
    {
      error: 'NextAuth is deprecated. Use Firebase Authentication instead.',
      redirectTo: '/sign-in',
    },
    { status: 410 },
  )
}
