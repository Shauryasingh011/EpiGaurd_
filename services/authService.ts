import {
  signIn,
  signUp,
  signInGoogle,
  signInGithub,
  signInFacebook,
  signOut as logoutAuth,
  getCurrentUserData,
  getToken,
} from '@/lib/auth'
import { saveUser } from '@/lib/firebase/firestore'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  success: boolean
  token: string
  user: {
    id: string
    name: string | null
    email: string | null
    role: string
  }
}

export type SignUpPayload = {
  email: string
  password: string
  name?: string
}

export type SignUpResponse = LoginResponse

/**
 * Login user with email and password
 */
export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const user = await signIn(payload.email, payload.password)
    const token = await getToken()

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'analyst',
      },
    }
  } catch (error) {
    console.error('Login failed:', error)
    throw new Error('Failed to login')
  }
}

/**
 * Register new user with email and password
 */
export async function registerUser(payload: SignUpPayload): Promise<SignUpResponse> {
  try {
    const user = await signUp(payload.email, payload.password)

    // Update user name if provided
    if (payload.name) {
      await saveUser(user.id, {
        name: payload.name,
      })
    }

    const token = await getToken()

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: payload.name || user.name,
        email: user.email,
        role: 'analyst',
      },
    }
  } catch (error) {
    console.error('Registration failed:', error)
    throw new Error('Failed to register user')
  }
}

/**
 * Login with Google OAuth
 */
export async function loginWithGoogle(): Promise<LoginResponse> {
  try {
    const user = await signInGoogle()
    const token = await getToken()

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'analyst',
      },
    }
  } catch (error) {
    console.error('Google login failed:', error)
    throw new Error('Failed to login with Google')
  }
}

/**
 * Login with GitHub OAuth
 */
export async function loginWithGithub(): Promise<LoginResponse> {
  try {
    const user = await signInGithub()
    const token = await getToken()

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'analyst',
      },
    }
  } catch (error) {
    console.error('GitHub login failed:', error)
    throw new Error('Failed to login with GitHub')
  }
}

/**
 * Login with Facebook OAuth
 */
export async function loginWithFacebook(): Promise<LoginResponse> {
  try {
    const user = await signInFacebook()
    const token = await getToken()

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'analyst',
      },
    }
  } catch (error) {
    console.error('Facebook login failed:', error)
    throw new Error('Failed to login with Facebook')
  }
}

/**
 * Logout current user
 */
export async function logoutUser(): Promise<void> {
  try {
    await logoutAuth()
  } catch (error) {
    console.error('Logout failed:', error)
    throw new Error('Failed to logout')
  }
}

/**
 * Get current logged-in user data
 */
export async function getCurrentUser() {
  try {
    return await getCurrentUserData()
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}
