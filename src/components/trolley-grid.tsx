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
      return "border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20"
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
    <div className="grid grid-cols-3 gap-3 md:gap-4">
      {slots.map((slot) => {
        const isAnimating = animatingSlot === slot.id
        const isTargetSlot = currentProduct && slot.status === "empty" && slot.id === currentProduct.correctSlot

        return (
          <motion.button
            key={slot.id}
            onClick={() => onSlotClick(slot.id)}
            disabled={!currentProduct || slot.status !== "empty"}
            whileHover={currentProduct && slot.status === "empty" ? { scale: 1.05 } : {}}
            whileTap={currentProduct && slot.status === "empty" ? { scale: 0.95 } : {}}
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
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }
                : {}
            }
            className={cn(
              "aspect-square rounded-lg border-2 transition-all duration-200 relative overflow-hidden",
              "flex flex-col items-center justify-center gap-2",
              "disabled:cursor-not-allowed",
              getSlotColor(slot),
              currentProduct && slot.status === "empty" && "cursor-pointer",
            )}
          >
            {isTargetSlot && (
              <motion.div
                className="absolute inset-0 border-2 border-blue-500 rounded-lg"
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [0.95, 1, 0.95],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            )}

            <AnimatePresence>
              {isAnimating && currentProduct && (
                <motion.div
                  initial={{ y: -200, scale: 0.5, opacity: 0, rotate: -180 }}
                  animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    duration: 0.8,
                  }}
                  className="absolute inset-0 flex items-center justify-center text-6xl z-10"
                >
                  {currentProduct.emoji}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={false}
              animate={slot.status !== "empty" && !isAnimating ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-1 w-full"
            >
              <span className="text-xs font-mono text-muted-foreground">{slot.position}</span>

              {slot.status === "empty" ? (
                <>
                  <span className="text-lg md:text-xl font-bold">{slot.id}</span>
                  {isTargetSlot && (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      className="text-xs font-bold text-blue-500"
                    >
                      AQUÍ
                    </motion.span>
                  )}
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="text-4xl"
                  >
                    {slot.productEmoji}
                  </motion.div>
                  <span className="text-[10px] text-center px-2 text-muted-foreground line-clamp-1">
                    {slot.productName}
                  </span>
                  {slot.placedCount && slot.quantity && (
                    <span className="text-[10px] font-bold text-primary">
                      {slot.placedCount}/{slot.quantity}
                    </span>
                  )}
                </>
              )}
            </motion.div>

            {slot.status === "correct" && isAnimating && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 0] }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 border-4 border-[var(--correct)] rounded-lg"
              />
            )}

            {slot.status === "incorrect" && isAnimating && (
              <motion.div
                animate={{ x: [-10, 10, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
