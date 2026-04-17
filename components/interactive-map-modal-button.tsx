"use client"

import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"
import { Info, Map, X } from "lucide-react"

import { Button } from "@/components/ui/button"

const InteractiveMap = dynamic(() => import("@/components/interactive-map"), { ssr: false })

export function InteractiveMapModalButton() {
  const [open, setOpen] = useState(false)
  const [mapKey, setMapKey] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const handleOpen = () => {
    setMapKey(Date.now())
    setShowInfo(false)
    setOpen(true)
  }

  return (
    <>
      <Button onClick={handleOpen} className="shadow-md" title="Show Interactive Map">
        <Map className="w-5 h-5" />
        <span className="hidden md:inline">Interactive Map</span>
      </Button>

      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-950/55 backdrop-blur-sm">
            <div
              className="glass-panel fixed flex flex-col overflow-hidden rounded-[28px] p-0 shadow-2xl"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(900px, calc(100vw - 32px))",
                height: "min(600px, calc(100vh - 32px))",
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div className="font-semibold text-foreground">Interactive Risk Map</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="z-[2000]" onClick={() => setShowInfo((v) => !v)} title="Info">
                    <Info className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="z-[2000]" onClick={() => setOpen(false)} title="Close">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {showInfo ? (
                <div className="border-b border-border px-4 py-3 text-sm text-muted-foreground">
                  Drag to pan • Use +/- to zoom • Click a marker for details • Use search to jump to a state
                </div>
              ) : null}

              <div className="flex-1 overflow-hidden rounded-b-[28px]">
                <InteractiveMap key={mapKey} height="100%" />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
