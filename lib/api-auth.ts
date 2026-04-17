/**
 * Firebase Admin SDK and API utilities for server-side operations
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Extract and verify Firebase ID token from request headers
 */
export async function getAuthTokenFromRequest(request: NextRequest): Promise<string | null> {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Check cookies as fallback
  const token = request.cookies.get('__firebase_token__')?.value
  return token || null
}

/**
 * Verify Firebase ID token (requires Firebase Admin SDK)
 * Use this in API routes that need authentication
 */
export async function verifyToken(token: string) {
  // Note: This requires firebase-admin to be installed and configured
  // For now, we'll return a placeholder
  // In production, use:
  // const admin = require('firebase-admin')
  // return await admin.auth().verifyIdToken(token)
  
  if (!token) {
    throw new Error('No token provided')
  }
  
  console.warn(
    'Token verification is not fully implemented. ' +
    'You need to set up Firebase Admin SDK for server-side auth verification. ' +
    'Install firebase-admin and initialize it with your service account.'
  )
  
  return { uid: 'demo-user' } // Placeholder
}

/**
 * Create an authenticated API response
 */
export function createAuthenticatedResponse(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

/**
 * Create an error response
 */
export function createErrorResponse(message: string, status = 400) {
  return NextResponse.json(
    { error: message },
    { status }
  )
}

/**
 * Middleware to protect API routes with Firebase authentication
 */
export async function withAuth(
  handler: (req: NextRequest, decodedToken: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const token = await getAuthTokenFromRequest(request)
      
      if (!token) {
        return createErrorResponse('Unauthorized: No token provided', 401)
      }

      const decodedToken = await verifyToken(token)
      return await handler(request, decodedToken)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return createErrorResponse('Unauthorized', 401)
    }
  }
}
