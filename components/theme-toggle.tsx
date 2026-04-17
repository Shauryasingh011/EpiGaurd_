"use client"

import { useEffect, useState } from "react"
import { Moon, SunMedium } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-10 w-[92px] rounded-xl border border-border bg-card/60" />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card/70 px-3 text-sm font-medium text-foreground transition hover:bg-accent/10"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <SunMedium className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-[var(--indigo-reign)]" />}
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  )
}
