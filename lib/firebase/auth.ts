import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'
import { auth } from './config'

export type User = {
  id: string
  email: string | null
  name: string | null
  image: string | null
  emailVerified: boolean
}

/**
 * Convert Firebase user to our User type
 */
export function firebaseUserToUser(user: FirebaseUser): User {
  return {
    id: user.uid,
    email: user.email,
    name: user.displayName,
    image: user.photoURL,
    emailVerified: user.emailVerified,
  }
}

/**
 * Set up authentication persistence
 */
export async function initAuthPersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence)
  } catch (error) {
    console.error('Failed to set auth persistence:', error)
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  return firebaseUserToUser(userCredential.user)
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return firebaseUserToUser(userCredential.user)
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')
  
  const result = await signInWithPopup(auth, provider)
  return firebaseUserToUser(result.user)
}

/**
 * Sign in with GitHub
 */
export async function signInWithGithub() {
  const provider = new GithubAuthProvider()
  provider.addScope('user:email')
  provider.addScope('read:user')
  
  const result = await signInWithPopup(auth, provider)
  return firebaseUserToUser(result.user)
}

/**
 * Sign in with Facebook
 */
export async function signInWithFacebook() {
  const provider = new FacebookAuthProvider()
  provider.addScope('email')
  provider.addScope('public_profile')
  
  const result = await signInWithPopup(auth, provider)
  return firebaseUserToUser(result.user)
}

/**
 * Sign out current user
 */
export async function logoutUser() {
  await signOut(auth)
}

/**
 * Get current user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser
}

/**
 * Get current user async
 */
export async function getCurrentUserAsync(): Promise<FirebaseUser | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(firebaseUserToUser(firebaseUser))
    } else {
      callback(null)
    }
  })
}

/**
 * Get auth token
 */
export async function getAuthToken(): Promise<string> {
  const user = auth.currentUser
  if (!user) {
    throw new Error('No authenticated user')
  }
  return await user.getIdToken()
}

