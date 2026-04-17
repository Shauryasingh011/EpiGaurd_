"use client"

import Lottie from "lottie-react"

import natureSkyAnimation from "@/public/animations/nature-sky-login.json"

export function LoginLottieBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.22),_transparent_40%),linear-gradient(180deg,rgba(12,20,38,0.15),rgba(3,10,24,0.7))]" />
      <Lottie
        animationData={natureSkyAnimation}
        loop
        autoplay
        className="h-full w-full scale-[1.35] opacity-90"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(253,240,213,0.12),transparent_28%,rgba(4,10,24,0.58)_100%)]" />
    </div>
  )
}
