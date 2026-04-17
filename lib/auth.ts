import { User } from 'firebase/auth'
import {
  firebaseUserToUser,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithGithub,
  signInWithFacebook,
  logoutUser,
  getCurrentUser,
  getCurrentUserAsync,
  onAuthStateChange,
  getAuthToken,
  initAuthPersistence,
} from './firebase/auth'
import {
  saveUser,
  getUser,
  findUserByEmail,
  FirestoreUser,
} from './firebase/firestore'

export type AuthUser = Awaited<ReturnType<typeof getUser>>

/**
 * Initialize authentication
 */
export async function initAuth() {
  await initAuthPersistence()
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string) {
  const user = await signUpWithEmail(email, password)
  
  // Save user to Firestore
  await saveUser(user.id, {
    email: user.email,
    name: user.name,
    image: user.image,
    emailVerified: user.emailVerified,
  })
  
  return user
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  return await signInWithEmail(email, password)
}

/**
 * Sign in with Google OAuth
 */
export async function signInGoogle() {
  const user = await signInWithGoogle()
  
  // Save or update user in Firestore
  const existingUser = await getUser(user.id)
  if (!existingUser) {
    await saveUser(user.id, {
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
    })
  }
  
  return user
}

/**
 * Sign in with GitHub OAuth
 */
export async function signInGithub() {
  const user = await signInWithGithub()
  
  // Save or update user in Firestore
  const existingUser = await getUser(user.id)
  if (!existingUser) {
    await saveUser(user.id, {
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
    })
  }
  
  return user
}

/**
 * Sign in with Facebook OAuth
 */
export async function signInFacebook() {
  const user = await signInWithFacebook()
  
  // Save or update user in Firestore
  const existingUser = await getUser(user.id)
  if (!existingUser) {
    await saveUser(user.id, {
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
    })
  }
  
  return user
}

/**
 * Sign out
 */
export async function signOut() {
  await logoutUser()
}

/**
 * Get current user
 */
export function useCurrentUser() {
  return getCurrentUser()
}

/**
 * Get current user async
 */
export async function getCurrentUserData(): Promise<AuthUser> {
  const firebaseUser = await getCurrentUserAsync()
  if (!firebaseUser) return null
  return await getUser(firebaseUser.uid)
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuthState(callback: (user: AuthUser) => void) {
  return onAuthStateChange(async (firebaseUserData) => {
    if (firebaseUserData) {
      const user = await getUser(firebaseUserData.id)
      callback(user)
    } else {
      callback(null)
    }
  })
}

/**
 * Get auth token for API calls
 */
export async function getToken(): Promise<string> {
  return await getAuthToken()
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}
