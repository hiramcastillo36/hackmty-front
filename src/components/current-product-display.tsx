"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock, RotateCcw, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import type { Product } from "@/components/trolley-manager"

interface ProductChecklistProps {
  products: Product[]
  currentProductIndex: number
  onReset: () => void
}

export default function ProductChecklist({ products, currentProductIndex, onReset }: ProductChecklistProps) {
  const allCompleted = currentProductIndex >= products.length

  return (
    <Card className="p-4 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h2 className="text-lg font-semibold">Lista de Productos</h2>
        <Button variant="outline" size="sm" onClick={onReset} className="gap-2 bg-transparent">
          <RotateCcw className="w-3 h-3" />
          Reiniciar
        </Button>
      </div>

      <div className="space-y-2">
        {products.map((product, index) => {
          const isCompleted = product.placed >= product.quantity
          const isCurrent = index === currentProductIndex
          const isPending = index > currentProductIndex

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`p-3 transition-all duration-300 ${
                  isCurrent
                    ? "border-2 border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/20"
                    : isCompleted
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-border bg-muted/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </motion.div>
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <Clock className="w-5 h-5 text-blue-500" />
                      </motion.div>
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <img className="text-2xl" src={product.imageUrl} alt={product.name} width={40} height={40} />
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold text-sm truncate ${
                            isCurrent ? "text-blue-500" : isCompleted ? "text-green-500" : "text-foreground"
                          }`}
                        >
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                            {product.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>Pos. {product.correctSlot}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Cantidad</span>
                        <span
                          className={`font-bold ${
                            isCompleted ? "text-green-500" : isCurrent ? "text-blue-500" : "text-muted-foreground"
                          }`}
                        >
                          {product.placed}/{product.quantity}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            isCompleted ? "bg-green-500" : isCurrent ? "bg-blue-500" : "bg-muted-foreground/30"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(product.placed / product.quantity) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Current Product Indicator */}
                    {isCurrent && !isCompleted && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-xs font-medium text-blue-500 flex items-center gap-1"
                      >
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        En progreso
                      </motion.div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Completion Message */}
      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 bg-green-500/10 border-2 border-green-500/30 rounded-lg text-center"
        >
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="font-bold text-green-500">¡Trolley Completo!</p>
          <p className="text-xs text-muted-foreground mt-1">Todos los productos han sido colocados</p>
        </motion.div>
      )}
    </Card>
  )
}