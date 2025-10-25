"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { motion, useAnimationControls, type PanInfo } from "framer-motion"
import { ArrowRight, Plane, Sparkles } from "lucide-react"
import { TopBar } from "@/components/top-bar"

const SWIPE_THRESHOLD = 220
const MAX_DRAG_DISTANCE = 280

export default function WelcomePage() {
  const router = useRouter()
  const controls = useAnimationControls()
  const [progress, setProgress] = useState(0)
  const [hasSwiped, setHasSwiped] = useState(false)

  const progressLabel = useMemo(() => Math.round((hasSwiped ? 1 : progress) * 100), [hasSwiped, progress])

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (hasSwiped) return
    const ratio = Math.min(Math.max(info.offset.x / SWIPE_THRESHOLD, 0), 1)
    setProgress(ratio)
  }

  const handleDragEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (hasSwiped) return
    if (info.offset.x >= SWIPE_THRESHOLD) {
      setHasSwiped(true)
      setProgress(1)
      await controls.start({
        x: MAX_DRAG_DISTANCE + 200,
        rotate: 10,
        scale: 1.05,
        opacity: 0,
        transition: { duration: 0.5, ease: "easeInOut" },
      })
      router.push("/ingreso")
      return
    }

    setProgress(0)
    await controls.start({
      x: 0,
      rotate: 0,
      transition: { type: "spring", stiffness: 420, damping: 32 },
    })
  }

  return (
    <main className="min-h-screen bg-[#001338] text-white">
      <TopBar tag="Welcome Lounge" />

      <section className="relative flex flex-col items-center px-6 py-16">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="absolute -right-16 top-24 h-80 w-80 rounded-full bg-[#0f4ed8]/30 blur-[130px]"
            animate={{ scale: [1, 1.1, 0.95, 1], opacity: [0.3, 0.7, 0.4, 0.3] }}
            transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="absolute -left-24 bottom-0 h-[420px] w-[420px] rounded-full bg-cyan-400/15 blur-[160px]"
            animate={{ scale: [1, 0.9, 1.15, 1], opacity: [0.2, 0.5, 0.35, 0.2] }}
            transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ opacity: [0.2, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.div>

        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center text-center">
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
            Bienvenido al ecosistema inteligente de servicio a bordo
          </h1>
        </div>

        <div className="relative z-10 mt-14 w-full max-w-4xl">
          <div className="rounded-[36px] border border-white/15 bg-white/5 p-8 shadow-[0_20px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="mt-8 rounded-[28px] border border-white/20 bg-[#001945]/70 p-6 shadow-inner shadow-black/30">
              <motion.div
                drag={!hasSwiped ? "x" : false}
                dragConstraints={{ left: 0, right: MAX_DRAG_DISTANCE }}
                dragElastic={0.08}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                initial={{ x: 0, rotate: 0 }}
                animate={controls}
                className="relative flex cursor-grab items-center justify-between rounded-3xl border border-white/30 bg-white/10 px-6 py-4 text-white shadow-[0_15px_35px_rgba(0,0,0,0.45)] backdrop-blur-xl active:cursor-grabbing"
              >
                <div className="flex flex-col text-left">
                  <span className="text-lg font-semibold">Desliza para comenzar</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  {progressLabel}%
                </div>
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-3xl border border-white/40"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>

              <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500"
                  animate={{ width: `${(hasSwiped ? 1 : progress) * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}

