"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Activity, Droplet, Users, Ambulance, Brain, BarChart3, Menu, X, MapPin, PanelLeft, Settings } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { signOut, useSession } from "next-auth/react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { InteractiveMapModalButton } from "@/components/interactive-map-modal-button"
import { TelegramBotButton } from "@/components/telegram-bot-button"
import { PageSkeleton } from "@/components/ui/page-skeleton"
import { ThemeToggle } from "@/components/theme-toggle"
import { notificationService } from "@/lib/notifications"
import { preferencesStorage } from "@/lib/storage"
import Dashboard from "./dashboard"
import { WaterQualityPage } from "@/components/water-quality-page"
import { CommunityReportingPage } from "@/components/community-reporting-page"
import { HealthcareResponsePage } from "@/components/healthcare-response-page"
import { MLPredictionsPage } from "@/components/ml-predictions-page"
import AnalyticsInsightsPage from "@/components/analytics-insights-page"
import { MyLocationPage } from "@/components/my-location-page"
import { SettingsPage } from "@/components/settings-page"
import { AIAssistantWidget } from "@/components/ai-assistant-panel"

type PageType = "dashboard" | "mylocation" | "water" | "community" | "healthcare" | "ml" | "analytics" | "settings"

export default function Home() {
  const { t, i18n } = useTranslation()
  const { data: session, status } = useSession()
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [showApiGuide, setShowApiGuide] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (status !== "authenticated") return
    if (typeof window === "undefined") return

    const run = async () => {
      try {
        const today = new Date()
        const key = `epiguard_daily_digest_${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`
        if (localStorage.getItem(key)) return

        const localPrefs = preferencesStorage.get()
        if (!localPrefs.notificationsEnabled) return

        const res = await fetch("/api/alerts/telegram/link-code", { cache: "no-store" })
        const payload = (await res.json().catch(() => null)) as any

        const selectedState = (payload?.settings?.selectedState || localPrefs.selectedState || "").toString().trim()
        const browserEnabled = payload?.settings?.browserEnabled ?? true
        const dailyEnabled = payload?.settings?.dailyDigestEnabled ?? true

        if (!browserEnabled || !dailyEnabled || !selectedState) return

        const digestRes = await fetch(`/api/digest/state?state=${encodeURIComponent(selectedState)}`, { cache: "no-store" })
        const digest = (await digestRes.json().catch(() => null)) as any
        if (!digestRes.ok || !digest?.ok) return

        const pct = Math.round(Number(digest.riskScore) * 100)
        const title = `Daily Risk Update: ${digest.state}`
        const body = `Risk: ${digest.overallRisk} (${pct}%)\nThreat: ${digest.primaryThreat}\n${Array.isArray(digest.preventions) ? `Prevention: ${digest.preventions[0]}` : ""}`

        await notificationService.requestPermission()
        await notificationService.show({
          title,
          body,
          tag: `daily_digest_${digest.state}`,
        })

        localStorage.setItem(key, "1")
      } catch {
        // best effort
      }
    }

    void run()
  }, [status])

  useEffect(() => {
    if (!profileOpen) return
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (profileRef.current?.contains(target)) return
      setProfileOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
    }
  }, [profileOpen])

  useEffect(() => {
    if (typeof window === "undefined") return
    const seen = window.sessionStorage.getItem("epiguard_ui_welcome")
    if (seen) return

    toast("Frontend integration ready", {
      description: "Your backend teammate can start in services/api.ts, services/authService.ts, and services/dashboardService.ts.",
      action: {
        label: "View",
        onClick: () => setShowApiGuide(true),
      },
    })
    window.sessionStorage.setItem("epiguard_ui_welcome", "1")
  }, [])

  const userLabel = useMemo(() => {
    const name = session?.user?.name?.trim()
    if (name) return name
    const email = session?.user?.email?.trim()
    if (email) return email
    return "Profile"
  }, [session?.user?.email, session?.user?.name])

  const userInitial = useMemo(() => {
    const source = session?.user?.name || session?.user?.email || ""
    const c = source.trim().charAt(0).toUpperCase()
    return c || "U"
  }, [session?.user?.email, session?.user?.name])

  const navItems = useMemo(
    () => [
      { id: "dashboard" as const, label: t("common.dashboard"), icon: Activity },
      { id: "mylocation" as const, label: t("common.myLocation"), icon: MapPin },
      { id: "water" as const, label: t("common.waterQuality"), icon: Droplet },
      { id: "community" as const, label: t("common.communityReports"), icon: Users },
      { id: "healthcare" as const, label: t("common.healthcareResponse"), icon: Ambulance },
      { id: "ml" as const, label: t("common.mlPredictions"), icon: Brain },
      { id: "analytics" as const, label: t("common.analytics"), icon: BarChart3 },
      { id: "settings" as const, label: t("common.settings"), icon: Settings },
    ],
    [t],
  )

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "mylocation":
        return <MyLocationPage />
      case "water":
        return <WaterQualityPage />
      case "community":
        return <CommunityReportingPage />
      case "healthcare":
        return <HealthcareResponsePage />
      case "ml":
        return <MLPredictionsPage />
      case "analytics":
        return <AnalyticsInsightsPage />
      case "settings":
        return <SettingsPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div key={i18n.language} className="app-shell flex h-screen bg-transparent text-foreground">
      <aside
        className={`${mobileMenuOpen ? "fixed inset-0" : "hidden"} md:block md:static ${isSidebarOpen ? "md:w-64" : "md:w-0"} glass-panel border-r border-border transition-all duration-300 z-40 w-full h-full md:h-screen overflow-hidden`}
      >
        <div className="flex h-full w-full flex-col md:w-64">
          <div className="flex items-center justify-between border-b border-border/80 p-6 md:justify-start">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-[linear-gradient(135deg,rgba(59,130,246,0.2),rgba(28,44,100,0.35))] shadow-inner">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="whitespace-nowrap text-lg font-bold">EpiGuard</h2>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Outbreak OS</p>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground md:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="premium-scrollbar flex-1 space-y-2 overflow-y-auto p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full whitespace-nowrap rounded-2xl px-4 py-3 text-left transition-all ${currentPage === item.id ? "bg-[linear-gradient(135deg,#1c2c64,#4f46e5)] text-[var(--butter)] shadow-lg" : "text-muted-foreground hover:translate-x-1 hover:bg-[rgba(28,44,100,0.08)] hover:text-foreground"}`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5 min-w-[1.25rem]" />
                    <span className="font-medium" suppressHydrationWarning>
                      {item.label}
                    </span>
                  </span>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto border-t border-border/70 p-4">
            <div className="rounded-[24px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--butter)_60%,var(--card)),color-mix(in_srgb,var(--indigo-reign)_18%,var(--card)))] p-4 text-sm whitespace-nowrap">
              <p className="mb-2 font-medium text-primary" suppressHydrationWarning>
                {t("system.systemStatus")}
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p suppressHydrationWarning>{t("system.databaseConnected")}</p>
                <p suppressHydrationWarning>{t("system.mlModelsActive")}</p>
                <p suppressHydrationWarning>{t("system.lastSync")}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="premium-scrollbar flex-1 overflow-y-auto">
        <div className="topbar-shell sticky top-0 z-30 flex items-center justify-between border-b border-border/70 p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden text-muted-foreground transition-colors hover:text-foreground md:flex">
              <PanelLeft className={`h-5 w-5 transition-transform ${!isSidebarOpen ? "rotate-180" : ""}`} />
            </button>
            <h1 className="font-bold md:hidden">EpiGuard</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <TelegramBotButton />
            <InteractiveMapModalButton />
            <button
              type="button"
              onClick={() => setShowApiGuide(true)}
              className="hidden rounded-xl border border-border bg-card/70 px-3 py-2 text-xs font-medium text-foreground transition hover:bg-accent/10 md:block"
            >
              API Handoff
            </button>

            <div className="relative" ref={profileRef}>
              {status === "authenticated" ? (
                <button
                  type="button"
                  aria-label={userLabel}
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-card/75 shadow-sm transition-colors hover:bg-accent/10 hover:shadow-md"
                >
                  {session?.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-foreground">{userInitial}</span>
                  )}
                </button>
              ) : (
                <a href="/sign-in" className="rounded-xl border border-border bg-card/70 px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-sky-300/10 transition-colors hover:bg-accent/10">
                  Sign in
                </a>
              )}

              {profileOpen && status === "authenticated" && (
                <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl backdrop-blur-xl">
                  <div className="px-4 py-3">
                    <div className="truncate text-base font-semibold">{session?.user?.name || "Account"}</div>
                    {session?.user?.email && <div className="truncate text-sm text-muted-foreground">{session.user.email}</div>}
                  </div>
                  <div className="border-t border-border" />
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false)
                      void signOut({ callbackUrl: "/sign-in" })
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent/10"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-muted-foreground hover:text-foreground md:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {status === "loading" ? (
            <PageSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showApiGuide ? (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowApiGuide(false)}
          >
            <motion.div
              className="glass-panel absolute right-4 top-4 w-[min(92vw,28rem)] rounded-[28px] p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.22 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Backend handoff</p>
                  <h3 className="mt-2 text-2xl font-semibold text-primary">API integration points</h3>
                </div>
                <button type="button" onClick={() => setShowApiGuide(false)} className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/5">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-border bg-card/55 p-4">
                  <p className="font-medium text-primary">`services/api.ts`</p>
                  <p className="mt-1">Base request wrapper. Add your real base URL and auth headers here.</p>
                </div>
                <div className="rounded-2xl border border-border bg-card/55 p-4">
                  <p className="font-medium text-primary">`services/authService.ts`</p>
                  <p className="mt-1">Mock login lives here now. Replace it with your backend `/auth/login` endpoint.</p>
                </div>
                <div className="rounded-2xl border border-border bg-card/55 p-4">
                  <p className="font-medium text-primary">`services/dashboardService.ts`</p>
                  <p className="mt-1">Ready to receive overview widgets and summary stats from the backend.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AIAssistantWidget />
    </div>
  )
}
