"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Package, MapPin, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Product } from "@/components/trolley-manager"

interface CurrentProductDisplayProps {
  currentProduct: Product | null
  currentIndex: number
  totalProducts: number
  onReset: () => void
}

export default function CurrentProductDisplay({
  currentProduct,
  currentIndex,
  totalProducts,
  onReset,
}: CurrentProductDisplayProps) {
  if (!currentProduct) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <Package className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-500 mb-2">¡Trolley Completo!</h3>
            <p className="text-sm text-muted-foreground mb-4">Todos los productos han sido colocados</p>
            <Button onClick={onReset} variant="outline" className="gap-2 bg-transparent">
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const progressPercent = (currentProduct.placed / currentProduct.quantity) * 100

  return (
    <Card className="p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <Badge variant="secondary" className="text-xs">
          Producto {currentIndex + 1} de {totalProducts}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {currentProduct.category}
        </Badge>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentProduct.id}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Product Icon */}
          <div className="flex justify-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="text-9xl"
            >
              {currentProduct.emoji}
            </motion.div>
          </div>

          {/* Product Name */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">{currentProduct.name}</h2>
            <p className="text-sm text-muted-foreground">Coloca este producto en el trolley</p>
          </div>

          {/* Quantity Display */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Cantidad a colocar</span>
              <span className="text-2xl font-bold text-primary">
                {currentProduct.placed}/{currentProduct.quantity}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Position Indicator */}
          <div className="bg-blue-500/10 rounded-lg p-4 border-2 border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/20">
                <MapPin className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Posición correcta</p>
                <p className="text-2xl font-bold text-blue-500">Compartimento {currentProduct.correctSlot}</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Instrucciones:</p>
              <p className="text-muted-foreground">
                Coloca <span className="font-bold text-foreground">{currentProduct.quantity}</span> unidades de{" "}
                <span className="font-bold text-foreground">{currentProduct.name}</span> en el compartimento{" "}
                <span className="font-bold text-foreground">{currentProduct.correctSlot}</span>
              </p>
            </div>
          </div>

          {/* Remaining Items */}
          {currentProduct.placed < currentProduct.quantity && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              className="text-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
            >
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500">
                Faltan {currentProduct.quantity - currentProduct.placed} unidades
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  )
}
