'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { initAuth, subscribeToAuthState } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null | undefined
  firebaseUser: FirebaseUser | null | undefined
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize Firebase auth
    const initializeAuth = async () => {
      try {
        await initAuth()
        setLoading(false)
      } catch (error) {
        console.error('Failed to initialize Firebase auth:', error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthState((userData) => {
      setUser(userData)
      setLoading(false)
    })

    // Also track Firebase user for some use cases
    const { onAuthStateChanged } = require('firebase/auth')
    const { auth } = require('@/lib/firebase/config')
    
    const unsubscribeFirebase = onAuthStateChanged(auth, (fUser: FirebaseUser | null) => {
      setFirebaseUser(fUser)
    })

    return () => {
      unsubscribe()
      unsubscribeFirebase()
    }
  }, [])

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthSessionProvider')
  }
  return context
}

/**
 * Hook to get current user
 */
export function useUser() {
  const { user } = useAuth()
  return user
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { isAuthenticated, loading } = useAuth()
  return { isAuthenticated, loading }
}
