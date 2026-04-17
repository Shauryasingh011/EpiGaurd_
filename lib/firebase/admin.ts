/**
 * Firebase Admin SDK - Server-only utilities
 * This file is only imported in API routes and server-side code
 */

import { initializeApp, cert, getApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let adminApp: any = null

/**
 * Initialize Firebase Admin SDK
 */
function getAdminApp() {
  if (adminApp) return adminApp

  try {
    adminApp = getApp()
    return adminApp
  } catch (error) {
    // App not initialized, initialize it
    const serviceAccount = process.env.FIREBASE_ADMIN_SDK_KEY
      ? JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY)
      : undefined

    if (!serviceAccount) {
      throw new Error('FIREBASE_ADMIN_SDK_KEY environment variable is not set')
    }

    adminApp = initializeApp({
      credential: cert(serviceAccount),
    })

    return adminApp
  }
}

/**
 * Get Firebase Admin Auth instance
 */
export function getAdminAuth() {
  return getAuth(getAdminApp())
}

/**
 * Get Firebase Admin Firestore instance
 */
export function getAdminFirestore() {
  return getFirestore(getAdminApp())
}

/**
 * Verify Firebase ID token (API route authentication)
 */
export async function verifyAuthToken(token: string) {
  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Token verification failed:', error)
    throw new Error('Invalid auth token')
  }
}
