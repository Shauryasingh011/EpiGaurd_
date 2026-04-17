import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAuthToken } from '@/lib/firebase/admin'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const requestUrl = new URL(req.url)
  const forceDirect = requestUrl.searchParams.get('direct') === '1'

  const usernameRaw = (process.env.TELEGRAM_BOT_USERNAME || '').trim().replace(/^@/, '')

  // If explicitly requested, ALWAYS go directly to the Telegram bot page (no send/update logic).
  if (forceDirect) {
    if (!usernameRaw) {
      return NextResponse.json(
        { ok: false, error: 'Telegram bot is not configured.' },
        { status: 500 },
      )
    }
    return NextResponse.redirect(`https://t.me/${usernameRaw}`, { status: 307 })
  }

  // Check Firebase auth token from cookies
  const cookieStore = await cookies()
  const token = cookieStore.get('__firebase_token__')?.value

  if (token) {
    try {
      await verifyAuthToken(token)
      // User is authenticated, redirect to /api/telegram/open to send an update
      const url = new URL('/api/telegram/open', req.url)
      return NextResponse.redirect(url, { status: 307 })
    } catch (error) {
      // Token is invalid, fall through to redirect to bot
    }
  }

  if (!usernameRaw) {
    return NextResponse.json(
      { ok: false, error: 'Telegram bot is not configured.' },
      { status: 500 },
    )
  }

  const url = `https://t.me/${usernameRaw}`
  return NextResponse.redirect(url, { status: 307 })
}
