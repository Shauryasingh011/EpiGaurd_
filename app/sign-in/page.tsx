'use client'

import { Suspense, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Leaf, ShieldCheck, Wind, Github, Chrome } from 'lucide-react'
import { toast } from 'sonner'

import { LoginLottieBackground } from '@/components/login/login-lottie-background'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  loginUser,
  loginWithGoogle,
  loginWithGithub,
  loginWithFacebook,
} from '@/services/authService'

function SignInPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const helperCards = useMemo(
    () => [
      {
        title: 'Live disease risk monitoring',
        icon: Wind,
        copy: 'Track outbreak probability using environmental vectors like rainfall, humidity, air quality, and water contamination signals.',
      },
      {
        title: 'Water, healthcare, and community reporting',
        icon: ShieldCheck,
        copy: 'Manage water quality alerts, healthcare response readiness, and citizen-submitted issue reports inside one command dashboard.',
      },
      {
        title: 'ML predictions and interactive intelligence',
        icon: Leaf,
        copy: 'Explore prediction scores, analytics insights, and interactive risk maps to support faster public-health decisions.',
      },
    ],
    [],
  )

  const handleEmailPasswordSignIn = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password) {
      setFormError('Email and password are required.')
      return
    }

    startTransition(() => {
      void (async () => {
        try {
          await loginUser({ email: trimmedEmail, password })
          toast.success('Login successful', {
            description: 'Welcome to EpiGuard!',
          })
          router.push(callbackUrl)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to sign in.'
          setFormError(message)
          toast.error('Login failed', {
            description: message,
          })
        }
      })()
    })
  }

  const handleGoogleSignIn = async () => {
    setFormError(null)
    startTransition(() => {
      void (async () => {
        try {
          await loginWithGoogle()
          toast.success('Login successful', {
            description: 'Welcome to EpiGuard!',
          })
          router.push(callbackUrl)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Google login failed'
          setFormError(message)
          toast.error('Login failed', {
            description: message,
          })
        }
      })()
    })
  }

  const handleGithubSignIn = async () => {
    setFormError(null)
    startTransition(() => {
      void (async () => {
        try {
          await loginWithGithub()
          toast.success('Login successful', {
            description: 'Welcome to EpiGuard!',
          })
          router.push(callbackUrl)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'GitHub login failed'
          setFormError(message)
          toast.error('Login failed', {
            description: message,
          })
        }
      })()
    })
  }

  const handleFacebookSignIn = async () => {
    setFormError(null)
    startTransition(() => {
      void (async () => {
        try {
          await loginWithFacebook()
          toast.success('Login successful', {
            description: 'Welcome to EpiGuard!',
          })
          router.push(callbackUrl)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Facebook login failed'
          setFormError(message)
          toast.error('Login failed', {
            description: message,
          })
        }
      })()
    })
  }

  return (
    <div className="login-page relative min-h-screen overflow-hidden bg-transparent">
      <LoginLottieBackground />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <section className="flex flex-col justify-between p-6 sm:p-8 lg:p-12">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200/20 bg-slate-950/25 shadow-lg shadow-sky-900/20 backdrop-blur-xl">
                <div className="h-5 w-5 rounded-full bg-[radial-gradient(circle_at_30%_30%,#fdf0d5,#60a5fa_42%,#1c2c64_100%)]" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-wide text-[var(--butter)]">EpiGuard</p>
                <p className="text-xs uppercase tracking-[0.28em] text-sky-100/65">Climate Health Command</p>
              </div>
            </Link>

            <div className="hidden rounded-full border border-white/10 bg-slate-950/20 px-4 py-2 text-xs text-sky-50/70 backdrop-blur-xl md:block">
              Indigo Reign + Dawn Butter theme
            </div>
          </div>

          <div className="max-w-2xl space-y-8 py-14 lg:py-20">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100/90 backdrop-blur-xl">
                <Leaf className="h-4 w-4" />
                Environmental intelligence for outbreak readiness
              </div>
              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-semibold leading-tight text-[var(--butter)] sm:text-5xl">
                  EpiGuard helps teams predict, monitor, and respond to climate-linked health risks in real time.
                </h1>
                <p className="max-w-xl text-base leading-7 text-sky-50/78 sm:text-lg">
                  From live disease risk monitoring and water-quality surveillance to healthcare coordination,
                  community reporting, ML-based outbreak scoring, analytics, and interactive risk maps, EpiGuard
                  brings every critical signal into one operational view.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {helperCards.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="login-feature-card rounded-[28px] p-5 transition duration-300 hover:-translate-y-1"
                  >
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-300/12 text-sky-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-base font-semibold text-[var(--butter)]">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-200/72">{item.copy}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-sky-50/55">
            <span>Mock login flow enabled for frontend testing</span>
            <span className="h-1 w-1 rounded-full bg-sky-100/35" />
            <span>Backend hook lives in `services/authService.ts`</span>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="login-card w-full max-w-md rounded-[32px] p-6 shadow-2xl shadow-slate-950/45 sm:p-8">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-100/60">Welcome back</p>
              <h2 className="text-3xl font-semibold text-[var(--butter)]">Sign in to EpiGuard</h2>
              <p className="text-sm leading-6 text-slate-200/72">
                Use Firebase authentication for secure sign-in.
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="mt-8 space-y-3">
              <Button
                onClick={handleGoogleSignIn}
                disabled={isPending}
                className="h-11 w-full rounded-2xl border border-white/20 bg-slate-900/40 text-white backdrop-blur-xl transition hover:bg-slate-800/60"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Sign in with Google
              </Button>
              
              <Button
                onClick={handleGithubSignIn}
                disabled={isPending}
                className="h-11 w-full rounded-2xl border border-white/20 bg-slate-900/40 text-white backdrop-blur-xl transition hover:bg-slate-800/60"
              >
                <Github className="mr-2 h-4 w-4" />
                Sign in with GitHub
              </Button>
              
              <Button
                onClick={handleFacebookSignIn}
                disabled={isPending}
                className="h-11 w-full rounded-2xl border border-white/20 bg-slate-900/40 text-white backdrop-blur-xl transition hover:bg-slate-800/60"
              >
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Sign in with Facebook
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-950/80 px-2 text-slate-400">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailPasswordSignIn} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-sky-50/90">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="your@email.com"
                  className="login-input h-12 rounded-2xl text-[var(--butter)] placeholder:text-slate-300/35"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-sky-50/90">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="login-input h-12 rounded-2xl text-[var(--butter)] placeholder:text-slate-300/35"
                />
              </div>

              {formError ? (
                <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  {formError}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={isPending}
                className="h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#60a5fa,#4f46e5_58%,#22c55e)] text-[var(--butter)] shadow-lg shadow-blue-950/30 transition hover:scale-[1.01] hover:shadow-xl"
              >
                {isPending ? 'Signing in...' : 'Sign in and continue'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-sm text-slate-300/72">
              Need an account?{' '}
              <Link href="/sign-up" className="font-medium text-sky-200 transition hover:text-white">
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInPageInner />
    </Suspense>
  )
}
