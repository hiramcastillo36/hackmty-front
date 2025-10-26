"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, Loader, AlertTriangle } from "lucide-react"
import Image from "next/image";
import { useTrolleyProducts, type Product } from "@/hooks/useTrolleyProducts"

interface TrolleyManagerProps {
  trolleyId: number | string
}

export default function TrolleyManager({ trolleyId }: TrolleyManagerProps) {
  const { products, loading, error, updateProductPlaced, resetProducts } = useTrolleyProducts(trolleyId)
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [placementStatus, setPlacementStatus] = useState<"correct" | "incorrect" | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  // Resetear estado cuando cambia el trolleyId
  useEffect(() => {
    console.log('🔄 TrolleyManager - trolleyId cambió a:', trolleyId);
    setCurrentProductIndex(0)
    setPlacementStatus(null)
    setIsComplete(false)
  }, [trolleyId])

  const currentProduct = products[currentProductIndex]

  const simulatePlacement = (isCorrect: boolean) => {
    if (!currentProduct || isComplete || placementStatus) return

    setPlacementStatus(isCorrect ? "correct" : "incorrect")
    setTimeout(() => setPlacementStatus(null), 400)

    if (isCorrect) {
      const newPlaced = currentProduct.placed + 1
      updateProductPlaced(currentProduct.id, newPlaced)

      if (newPlaced >= currentProduct.quantity) {
        setTimeout(() => {
          if (currentProductIndex < products.length - 1) {
            setCurrentProductIndex(currentProductIndex + 1)
          } else {
            setIsComplete(true)
          }
        }, 500)
      }
    }
    else
      reproducirVoz("El producto no va ahí, colócalo en el estante de bebidas, por favor.");
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c") simulatePlacement(true)
      else if (e.key.toLowerCase() === "i") simulatePlacement(false)
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentProduct, isComplete, placementStatus, products.length, currentProductIndex])

  const handleReset = () => {
    resetProducts()
    setCurrentProductIndex(0)
    setIsComplete(false)
  }

  // --- Vistas de Renderizado ---

  if (loading) {
    return (
      <Card className="w-screen h-screen rounded-none border-none flex flex-col items-center justify-center text-center">
        <Loader className="animate-spin h-16 w-16 text-primary" />
        <h2 className="mt-6 text-3xl font-bold">Cargando Trolley...</h2>
        <p className="mt-2 text-lg text-muted-foreground">Conectando con la API.</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-screen h-screen rounded-none border-none flex flex-col items-center justify-center text-center bg-destructive text-destructive-foreground">
        <AlertTriangle size={128} />
        <h2 className="mt-6 text-4xl font-bold">Error de Conexión</h2>
        <p className="mt-2 text-lg">{error}</p>
      </Card>
    )
  }

  if (isComplete) {
    return (
      <Card
        className="w-screen h-screen rounded-none border-none flex flex-col items-center justify-center text-center bg-[var(--correct)] text-primary-foreground cursor-pointer"
        onClick={handleReset}
      >
        <CheckCircle2 size={128} />
        <h2 className="mt-6 text-5xl font-bold">¡Trolley Lleno!</h2>
        <p className="mt-2 text-lg">Has completado la tarea exitosamente.</p>
        <p className="mt-8 text-sm opacity-70">Click para reiniciar</p>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "w-screen h-screen rounded-none border-none flex flex-col items-center justify-center text-center transition-colors duration-200",
        placementStatus === "correct" && "bg-[var(--correct)] text-primary-foreground",
        placementStatus === "incorrect" && "bg-[var(--incorrect)] text-primary-foreground"
      )}
    >
      {placementStatus ? (
        placementStatus === "correct" ? <CheckCircle2 size={192} /> : <XCircle size={192} />
      ) : (
        <>
          <Image
            alt={currentProduct?.name || 'Product Image'}
            src={currentProduct?.imageUrl}
            width={256}
            height={256}
            className="text-9xl"
          />
          <h2 className="mt-6 text-5xl font-bold">{currentProduct?.name}</h2>
          <p className="mt-2 text-lg text-muted-foreground">Coloca este producto en su lugar correcto.</p>
          <p className="mt-4 text-xl font-semibold">
            {currentProduct?.placed || 0} / {currentProduct?.quantity || 0}
          </p>
          <div className="absolute bottom-10 text-sm text-muted-foreground">
            Presiona 'C' para correcto, 'I' para incorrecto.
          </div>
        </>
      )}
    </Card>
  )

  async function reproducirVoz(texto) {
    try {
      const res = await fetch("/api/voz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: texto }),
      });

      if (!res.ok) throw new Error("Error al generar voz");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error(err);
    }
  }
}
