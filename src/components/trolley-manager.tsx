"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plane, CheckCircle2, XCircle, Circle, Camera } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import TrolleyGrid from "@/components/trolley-grid"
import CurrentProductDisplay from "@/components/current-product-display"

export type SlotStatus = "empty" | "correct" | "incorrect"

export interface TrolleySlot {
  id: number
  status: SlotStatus
  productId: string | null
  position: string
  productName?: string
  productEmoji?: string
  quantity?: number
  placedCount?: number
}

export interface Product {
  id: string
  name: string
  correctSlot: number
  quantity: number
  placed: number
  emoji: string
  category: string
}

const initialProducts: Product[] = [
  { id: "P001", name: "Coca-Cola", correctSlot: 1, quantity: 12, placed: 0, emoji: "🥤", category: "Bebidas" },
  { id: "P002", name: "Agua Mineral", correctSlot: 2, quantity: 15, placed: 0, emoji: "💧", category: "Bebidas" },
  { id: "P003", name: "Jugo de Naranja", correctSlot: 3, quantity: 10, placed: 0, emoji: "🧃", category: "Bebidas" },
  { id: "P004", name: "Café", correctSlot: 4, quantity: 20, placed: 0, emoji: "☕", category: "Calientes" },
  { id: "P005", name: "Té", correctSlot: 5, quantity: 15, placed: 0, emoji: "🍵", category: "Calientes" },
  { id: "P006", name: "Papas Fritas", correctSlot: 6, quantity: 18, placed: 0, emoji: "🍟", category: "Snacks" },
  { id: "P007", name: "Galletas", correctSlot: 7, quantity: 20, placed: 0, emoji: "🍪", category: "Snacks" },
  { id: "P008", name: "Chocolate", correctSlot: 8, quantity: 15, placed: 0, emoji: "🍫", category: "Snacks" },
  { id: "P009", name: "Cacahuates", correctSlot: 9, quantity: 12, placed: 0, emoji: "🥜", category: "Snacks" },
  { id: "P010", name: "Servilletas", correctSlot: 10, quantity: 30, placed: 0, emoji: "🧻", category: "Utensilios" },
  { id: "P011", name: "Vasos", correctSlot: 11, quantity: 25, placed: 0, emoji: "🥤", category: "Utensilios" },
  { id: "P012", name: "Cubiertos", correctSlot: 12, quantity: 30, placed: 0, emoji: "🍴", category: "Utensilios" },
]

const initialSlots: TrolleySlot[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  status: "empty",
  productId: null,
  position: `${String.fromCharCode(65 + Math.floor(i / 3))}${(i % 3) + 1}`,
}))

export default function TrolleyManager() {
  const [slots, setSlots] = useState<TrolleySlot[]>(initialSlots)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [animatingSlot, setAnimatingSlot] = useState<number | null>(null)
  const [showErrorOverlay, setShowErrorOverlay] = useState(false)

  const currentProduct = products[currentProductIndex]

  const handleProductPlaced = (slotId: number, isCorrect: boolean) => {
    const slot = slots.find((s) => s.id === slotId)
    if (!slot || !currentProduct) return

    const newStatus: SlotStatus = isCorrect ? "correct" : "incorrect"
    setAnimatingSlot(slotId)

    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotId) {
          const existingCount = s.placedCount || 0
          return {
            ...s,
            status: newStatus,
            productId: currentProduct.id,
            productName: currentProduct.name,
            productEmoji: currentProduct.emoji,
            quantity: currentProduct.quantity,
            placedCount: existingCount + 1,
          }
        }
        return s
      }),
    )

    setProducts((prev) => prev.map((p) => (p.id === currentProduct.id ? { ...p, placed: p.placed + 1 } : p)))

    setTimeout(() => {
      setAnimatingSlot(null)
    }, 800)

    if (currentProduct.placed + 1 >= currentProduct.quantity) {
      setTimeout(() => {
        if (currentProductIndex < products.length - 1) {
          setCurrentProductIndex(currentProductIndex + 1)
        }
      }, 1000)
    }
  }

  const handleSlotClick = (slotId: number) => {
    if (!currentProduct || animatingSlot || showErrorOverlay) return
    const slot = slots.find((s) => s.id === slotId)
    if (!slot || currentProduct.placed >= currentProduct.quantity) return

    const isCorrectPlacement = currentProduct.correctSlot === slotId

    if (slot.status === "empty") {
      if (!isCorrectPlacement) {
        setShowErrorOverlay(true)
        setTimeout(() => setShowErrorOverlay(false), 1500)
      }
      handleProductPlaced(slotId, isCorrectPlacement)
    } else if (slot.productId === currentProduct.id) {
      handleProductPlaced(slotId, slot.status === "correct")
    } else {
      setShowErrorOverlay(true)
      setTimeout(() => setShowErrorOverlay(false), 1500)
    }
  }

  const handleReset = () => {
    setSlots(initialSlots)
    setProducts(initialProducts)
    setCurrentProductIndex(0)
    setAnimatingSlot(null)
  }

  const completedProducts = products.filter((p) => p.placed >= p.quantity).length
  const totalProducts = products.length
  const correctSlots = slots.filter((s) => s.status === "correct").length
  const incorrectSlots = slots.filter((s) => s.status === "incorrect").length
  const progress = (completedProducts / totalProducts) * 100

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <AnimatePresence>
        {showErrorOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-500/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="flex flex-col items-center gap-4 text-white"
            >
              <motion.div
                animate={{
                  rotate: [0, -15, 15, -15, 15, 0],
                }}
                transition={{ duration: 0.5, repeat: 0 }}
              >
                <XCircle size={128} />
              </motion.div>
              <h2 className="text-4xl font-bold">¡Ubicación Incorrecta!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Plane className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Sistema de Llenado de Trolley</h1>
              <p className="text-sm text-muted-foreground">Vuelo AA-1234 • Salida: 14:30</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <Camera className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-500">Cámara Activa</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progreso Total</span>
          <span className="text-sm font-bold">
            {completedProducts}/{totalProducts} productos
          </span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {/* Current Product to Place */}
      <Card className="mb-6 p-6 flex flex-col items-center justify-center text-center">
        <span className="text-7xl md:text-9xl">{currentProduct?.emoji}</span>
        <h2 className="mt-4 text-2xl md:text-3xl font-bold text-foreground">{currentProduct?.name}</h2>
        <p className="text-sm text-muted-foreground">Coloca este producto en su lugar correcto.</p>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Product Display */}
        <div className="lg:col-span-1">
          <CurrentProductDisplay
            products={products}
            currentProductIndex={currentProductIndex}
            onReset={handleReset}
          />
        </div>

        {/* Trolley Grid */}
        <div className="lg:col-span-2">
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Trolley - Vista Frontal</h2>
              <Button variant="outline" size="sm" onClick={handleReset} className="text-xs bg-transparent">
                Reiniciar
              </Button>
            </div>
            <TrolleyGrid
              slots={slots}
              onSlotClick={handleSlotClick}
              currentProduct={currentProduct}
              animatingSlot={animatingSlot}
            />
          </Card>
        </div>
      </div>

      {/* Legend */}
      <Card className="mt-6 p-4">
        <h3 className="text-sm font-semibold mb-3">Leyenda</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-[var(--empty)] bg-[var(--empty)]/10" />
            <span className="text-sm text-muted-foreground">Vacío / Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-[var(--correct)] bg-[var(--correct)]/10" />
            <span className="text-sm text-muted-foreground">Colocado Correctamente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-[var(--incorrect)] bg-[var(--incorrect)]/10" />
            <span className="text-sm text-muted-foreground">Colocado Incorrectamente</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
