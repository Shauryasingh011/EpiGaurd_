import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAuthToken, getAdminFirestore } from '@/lib/firebase/admin'
import { buildTelegramStartLink, telegramBotUsername } from '@/lib/telegram'

export const runtime = 'nodejs'

function generateCode(): string {
  // Short, URL-safe code
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
}

async function getUserIdFromToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('__firebase_token__')?.value

  if (!token) return null

  try {
    const decodedToken = await verifyAuthToken(token)
    return decodedToken.uid
  } catch (error) {
    return null
  }
}

export async function GET() {
  const userId = await getUserIdFromToken()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminFirestore()
  const userDoc = await db.collection('users').doc(userId).get()

  if (!userDoc.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const userData = userDoc.data()
  const botUsername = telegramBotUsername()
  const hasBot = Boolean(botUsername)

  const alertSettingsDoc = await db.collection('userAlertSettings').doc(userId).get()
  const alertSettings = alertSettingsDoc.data()

  return NextResponse.json({
    telegram: {
      hasBot,
      botUsername: botUsername || null,
      chatIdLinked: Boolean(userData?.telegramChatId),
      telegramUsername: userData?.telegramUsername,
      telegramOptIn: userData?.telegramOptIn,
    },
    settings: alertSettings,
  })
}

type CreateLinkCodeBody = {
  selectedState?: string
  browserEnabled?: boolean
  dailyDigestEnabled?: boolean
}

export async function POST(req: Request) {
  const userId = await getUserIdFromToken()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as CreateLinkCodeBody
  const selectedState = (body.selectedState ?? '').toString().trim()

  if (selectedState && selectedState.length > 80) {
    return NextResponse.json({ error: 'Invalid state.' }, { status: 400 })
  }

  const db = getAdminFirestore()

  // Save alert settings updates
  const alertSettingsRef = db.collection('userAlertSettings').doc(userId)
  const existingSettings = await alertSettingsRef.get()

  await alertSettingsRef.set(
    {
      userId,
      selectedState: selectedState || existingSettings.data()?.selectedState || '',
      browserEnabled: typeof body.browserEnabled === 'boolean' ? body.browserEnabled : true,
      dailyDigestEnabled: typeof body.dailyDigestEnabled === 'boolean' ? body.dailyDigestEnabled : true,
      updatedAt: new Date(),
    },
    { merge: true },
  )

  // Create a one-time link code
  const codesQuery = await db
    .collection('telegramLinkCodes')
    .where('userId', '==', userId)
    .get()

  const batch = db.batch()
  codesQuery.docs.forEach((doc) => batch.delete(doc.ref))
  await batch.commit()

  const code = generateCode()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  await db.collection('telegramLinkCodes').add({
    userId,
    code,
    expiresAt,
    createdAt: new Date(),
  })

  const startLink = buildTelegramStartLink(code)

  return NextResponse.json({
    ok: true,
    code,
    expiresAt,
    startLink,
    botUsername: telegramBotUsername() || null,
  })
}
