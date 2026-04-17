'use client'

import { Suspense, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Chrome, Github } from 'lucide-react'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  registerUser,
  loginWithGoogle,
  loginWithGithub,
  loginWithFacebook,
} from '@/services/authService'

function AppLogo() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center font-semibold">E</div>
      <div className="leading-tight">
        <div className="text-base font-semibold">EpiGuard</div>
        <div className="text-xs text-muted-foreground">Disease outbreak monitoring</div>
      </div>
    </div>
  )
}

function SignUpPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password) {
      setError('Email and password are required.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    startTransition(() => {
      void (async () => {
        try {
          await registerUser({
            email: trimmedEmail,
            password,
            name: name.trim() || undefined,
          })

          toast.success('Account created successfully!', {
            description: 'Redirecting to dashboard...',
          })

          router.push(callbackUrl)
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Registration failed.'
          setError(message)
          toast.error('Registration failed', {
            description: message,
          })
        }
      })()
    })
  }

  const handleGoogleSignUp = async () => {
    setError(null)
    startTransition(() => {
      void (async () => {
        try {
          await loginWithGoogle()
          toast.success('Account created successfully!', {
            description: 'Redirecting to dashboard...',
          })
          router.push(callbackUrl)
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Google sign-up failed'
          setError(message)
          toast.error('Sign-up failed', {
            description: message,
          })
        }
      })()
    })
  }

  const handleGithubSignUp = async () => {
    setError(null)
    startTransition(() => {
      void (async () => {
        try {
          await loginWithGithub()
          toast.success('Account created successfully!', {
            description: 'Redirecting to dashboard...',
          })
          router.push(callbackUrl)
        } catch (e) {
          const message = e instanceof Error ? e.message : 'GitHub sign-up failed'
          setError(message)
          toast.error('Sign-up failed', {
            description: message,
          })
        }
      })()
    })
  }

  const handleFacebookSignUp = async () => {
    setError(null)
    startTransition(() => {
      void (async () => {
        try {
          await loginWithFacebook()
          toast.success('Account created successfully!', {
            description: 'Redirecting to dashboard...',
          })
          router.push(callbackUrl)
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Facebook sign-up failed'
          setError(message)
          toast.error('Sign-up failed', {
            description: message,
          })
        }
      })()
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 sm:p-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <AppLogo />
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
                  <p className="text-sm text-muted-foreground">Sign up to use EpiGuard</p>
                </div>
              </div>

              {error && (
                <Alert className="border-red-500/40 bg-red-500/10">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isPending}
                  className="relative w-full overflow-hidden bg-slate-900/40 text-white border border-white/20 backdrop-blur-xl transition hover:bg-slate-800/60"
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  <span className="relative">Sign up with Google</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleGithubSignUp}
                  disabled={isPending}
                  className="relative w-full overflow-hidden bg-slate-900/40 text-white border border-white/20 backdrop-blur-xl transition hover:bg-slate-800/60"
                >
                  <Github className="mr-2 h-4 w-4" />
                  <span className="relative">Sign up with GitHub</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleFacebookSignUp}
                  disabled={isPending}
                  className="relative w-full overflow-hidden bg-slate-900/40 text-white border border-white/20 backdrop-blur-xl transition hover:bg-slate-800/60"
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="relative">Sign up with Facebook</span>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <form onSubmit={handleEmailSignUp} className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name (optional)</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="••••••••"
                    />
                    <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="••••••••"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? 'Creating…' : 'Create account'}
                  </Button>
                </form>
              </div>

              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center bg-muted">
            <div className="relative h-full w-full p-10">
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-background" />
              <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-muted-foreground/10" />
              <div className="absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-muted-foreground/10" />
              <div className="relative z-10 flex h-full items-end">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Create your EpiGuard account</div>
                  <div className="text-sm text-muted-foreground">
                    Sign up with Google or email to start tracking outbreaks.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpPageInner />
    </Suspense>
  )
}
