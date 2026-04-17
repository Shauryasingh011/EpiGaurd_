import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { extractStartCode, telegramSendMessage, type TelegramWebhookUpdate } from '@/lib/telegram'

export const runtime = 'nodejs'

type DigestApiResponse = {
  ok: boolean
  updatedAt?: string
  state?: string
  riskScore?: number
  overallRisk?: 'Low' | 'Medium' | 'High' | 'Critical'
  primaryThreat?: string
  environmentalFactors?: {
    temp: number
    humidity: number
    pm25: number
    waterQuality: string
  } | null
  preventions?: string[]
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, value))
}

function getBaseUrl(): string {
  const explicit = process.env.APP_BASE_URL
  if (explicit) return explicit.replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return ''
}

async function fetchDigest(baseUrl: string, state: string): Promise<DigestApiResponse | null> {
  try {
    const url = `${baseUrl}/api/digest/state?state=${encodeURIComponent(state)}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as DigestApiResponse
  } catch {
    return null
  }
}

function isAuthorized(req: Request): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!expected) {
    // Dev friendliness if you haven't configured the secret yet.
    return process.env.NODE_ENV !== 'production'
  }

  const got = req.headers.get('x-telegram-bot-api-secret-token')
  return got === expected
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const update = (await req.json().catch(() => null)) as TelegramWebhookUpdate | null
  if (!update) return NextResponse.json({ ok: true })

  const parsed = extractStartCode(update)
  if (!parsed) return NextResponse.json({ ok: true })

  const { chatId, username, code } = parsed

  // We only link on /start <code>
  if (!code) {
    return NextResponse.json({ ok: true })
  }

  const db = getAdminFirestore()
  const linkCodeDocs = await db.collection('telegramLinkCodes').where('code', '==', code).get()

  if (linkCodeDocs.empty) {
    return NextResponse.json({ ok: true })
  }

  const record = linkCodeDocs.docs[0]
  const recordData = record.data()

  if (recordData.expiresAt.toDate?.().getTime?.() < Date.now()) {
    await record.ref.delete().catch(() => {})
    return NextResponse.json({ ok: true })
  }

  const userId = recordData.userId

  // Update user and delete link code in Firestore
  const batch = db.batch()
  batch.update(db.collection('users').doc(userId), {
    telegramChatId: chatId,
    telegramUsername: username ?? null,
    telegramOptIn: true,
    telegramOptInAt: new Date(),
    updatedAt: new Date(),
  })
  batch.delete(record.ref)
  await batch.commit()

  // Best-effort: send an immediate state update after linking.
  try {
    const baseUrl = getBaseUrl()
    if (baseUrl) {
      const settingsDoc = await db.collection('userAlertSettings').doc(userId).get()
      const settingsData = settingsDoc.data()

      const selectedState = (settingsData?.selectedState ?? '').trim()
      if (selectedState) {
        const digest = await fetchDigest(baseUrl, selectedState)
        if (digest?.ok && digest.state && typeof digest.riskScore === 'number') {
          const pct = String(Math.round(clamp01(digest.riskScore) * 100))
          const level = digest.overallRisk ?? 'Low'
          const primaryThreat = (digest.primaryThreat ?? 'Unknown').toString()
          const preventions = Array.isArray(digest.preventions) ? digest.preventions : []
          const env = digest.environmentalFactors

          const envLine = env
            ? `Env: ${Math.round(env.temp)}°C, ${Math.round(env.humidity)}% humidity, PM2.5 ${Math.round(env.pm25)}, Water ${escapeHtml(env.waterQuality)}`
            : null

          const link = 'https://epigaurd.vercel.app/'

          const text =
            `EpiGuard Update\n` +
            `State: ${escapeHtml(digest.state)}\n` +
            `<b>Risk: ${escapeHtml(String(level))} (${escapeHtml(pct)}%)</b>\n` +
            `Primary threat: ${escapeHtml(primaryThreat)}\n` +
            (envLine ? `${envLine}\n\n` : `\n`) +
            `Preventions:\n` +
            `- ${escapeHtml(preventions[0] ?? '')}\n` +
            `- ${escapeHtml(preventions[1] ?? '')}\n` +
            `- ${escapeHtml(preventions[2] ?? '')}\n` +
            `- ${escapeHtml(preventions[3] ?? '')}\n` +
            `- ${escapeHtml(preventions[4] ?? '')}\n\n` +
            `Details: ${link}`

          await telegramSendMessage({ chatId, text, parseMode: 'HTML', disableWebPagePreview: true })
        }
      }
    }
  } catch {
    // best-effort; ignore
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  // Simple health check
  return NextResponse.json({ ok: true })
}
