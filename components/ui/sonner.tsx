"use client"

import { Toaster } from "sonner"

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      theme="dark"
      toastOptions={{
        className:
          "!border-white/10 !bg-slate-950/85 !text-slate-50 !backdrop-blur-2xl",
      }}
    />
  )
}
