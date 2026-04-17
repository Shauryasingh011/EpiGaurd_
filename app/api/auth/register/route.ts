import { NextResponse } from 'next/server'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { saveUser } from '@/lib/firebase/firestore'

export const runtime = 'nodejs'

type RegisterBody = {
  name?: string
  email?: string
  password?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as RegisterBody

    const name = (body.name ?? '').toString().trim()
    const email = (body.email ?? '').toString().trim().toLowerCase()
    const password = (body.password ?? '').toString()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 },
      )
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Save user to Firestore
    await saveUser({
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: name || firebaseUser.displayName || null,
      image: firebaseUser.photoURL || null,
      emailVerified: firebaseUser.emailVerified,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      ok: true,
      user: {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: name || null,
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('[register error]', error)

    // Firebase auth error handling
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json(
        { error: 'An account with that email already exists.' },
        { status: 409 },
      )
    }

    if (error.code === 'auth/invalid-email') {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    if (error.code === 'auth/weak-password') {
      return NextResponse.json({ error: 'Password is too weak.' }, { status: 400 })
    }

    return NextResponse.json(
      { error: error.message || 'Registration failed.' },
      { status: 500 },
    )
  }
}
