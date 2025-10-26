"use client"

import { cn } from "@/lib/utils"
import type { TrolleySlot, Product } from "@/components/trolley-manager"
import { motion, AnimatePresence } from "framer-motion"

interface TrolleyGridProps {
  slots: TrolleySlot[]
  onSlotClick: (slotId: number) => void
  currentProduct: Product | null
  animatingSlot: number | null
}

export default function TrolleyGrid({ slots, onSlotClick, currentProduct, animatingSlot }: TrolleyGridProps) {
  const getSlotColor = (slot: TrolleySlot) => {
    if (currentProduct && slot.status === "empty" && slot.id === currentProduct.correctSlot) {
      return "border-blue-500 bg-blue-500/20 ring-4 ring-blue-500/30 shadow-xl shadow-blue-500/30"
    }

    switch (slot.status) {
      case "empty":
        return "border-[var(--empty)] bg-[var(--empty)]/10 hover:bg-[var(--empty)]/20"
      case "correct":
        return "border-[var(--correct)] bg-[var(--correct)]/10"
      case "incorrect":
        return "border-[var(--incorrect)] bg-[var(--incorrect)]/10"
    }
  }

  return (
    <div className="space-y-4">
      {/* Trolley compartments - 4 filas de compartimentos rectangulares */}
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="space-y-2">
          {/* Row label */}
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-lg border-2 border-border">
              <span className="text-lg font-bold text-foreground">{String.fromCharCode(65 + row)}</span>
            </div>
            <div className="flex-1 h-1 bg-border rounded" />
          </div>

          {/* 3 compartimentos por fila - rectangulares y alargados */}
          <div className="grid grid-cols-3 gap-3">
            {slots.slice(row * 3, row * 3 + 3).map((slot) => {
              const isAnimating = animatingSlot === slot.id
              const isTargetSlot = currentProduct && slot.status === "empty" && slot.id === currentProduct.correctSlot

              return (
                <motion.button
                  key={slot.id}
                  onClick={() => onSlotClick(slot.id)}
                  disabled={!currentProduct || slot.status !== "empty"}
                  whileHover={currentProduct && slot.status === "empty" ? { scale: 1.02 } : {}}
                  whileTap={currentProduct && slot.status === "empty" ? { scale: 0.98 } : {}}
                  animate={
                    isTargetSlot
                      ? {
                          scale: [1, 1.05, 1],
                        }
                      : {}
                  }
                  transition={
                    isTargetSlot
                      ? {
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                        }
                      : {}
                  }
                  className={cn(
                    "aspect-[16/9] rounded-xl border-4 transition-all duration-300 relative overflow-hidden",
                    "flex flex-col items-center justify-center gap-2 p-4",
                    "disabled:cursor-not-allowed shadow-lg",
                    getSlotColor(slot),
                    currentProduct && slot.status === "empty" && "cursor-pointer",
                  )}
                >
                  {/* Efecto de brillo para el slot objetivo */}
                  {isTargetSlot && (
                    <>
                      <motion.div
                        className="absolute inset-0 border-4 border-blue-400 rounded-xl"
                        animate={{
                          opacity: [0.3, 1, 0.3],
                          scale: [0.98, 1.02, 0.98],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                        }}
                      />
                      <motion.div
                        className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full"
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                      >
                        AQUÍ
                      </motion.div>
                    </>
                  )}

                  {/* Animación de producto entrando */}
                  <AnimatePresence>
                    {isAnimating && currentProduct && (
                      <motion.div
                        initial={{ y: -300, scale: 0.3, opacity: 0, rotate: -180 }}
                        animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 150,
                          damping: 12,
                          duration: 1,
                        }}
                        className="absolute inset-0 flex items-center justify-center text-7xl z-10 drop-shadow-2xl"
                      >
                        {currentProduct.emoji}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={false}
                    animate={
                      slot.status !== "empty" && !isAnimating ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }
                    }
                    className="flex flex-col items-center justify-center gap-2 w-full h-full"
                  >
                    {slot.status === "empty" ? (
                      <>
                        <span className="text-3xl font-bold text-muted-foreground/30">{slot.id}</span>
                        <span className="text-sm font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded">
                          {slot.position}
                        </span>
                      </>
                    ) : (
                      <>
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                          className="grid grid-cols-4 gap-1 w-full"
                        >
                          {Array.from({ length: Math.min(slot.placedCount || 0, 12) }).map((_, i) => (
                            <motion.span
                              key={i}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="text-3xl flex items-center justify-center"
                            >
                              {slot.productEmoji}
                            </motion.span>
                          ))}
                        </motion.div>
                        {(slot.placedCount || 0) > 12 && (
                          <span className="text-sm font-bold text-primary bg-primary/20 px-3 py-1 rounded-full">
                            +{(slot.placedCount || 0) - 12} más
                          </span>
                        )}
                        <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1 border border-border">
                          <p className="text-xs font-semibold text-center truncate">{slot.productName}</p>
                          {slot.placedCount && slot.quantity && (
                            <p className="text-xs font-bold text-center text-primary">
                              {slot.placedCount}/{slot.quantity}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>

                  {/* Efectos de validación */}
                  {slot.status === "correct" && isAnimating && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.5, 0] }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 border-8 border-[var(--correct)] rounded-xl"
                    />
                  )}

                  {slot.status === "incorrect" && isAnimating && (
                    <motion.div
                      animate={{ x: [-15, 15, -15, 15, 0] }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
