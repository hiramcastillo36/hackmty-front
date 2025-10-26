"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, Loader, AlertTriangle } from "lucide-react"
import Image from "next/image";

// --- Interfaces para la Simulación ---
export interface Product {
  id: string
  name: string
  correctSlot: number
  quantity: number
  placed: number
  imageUrl: string
  category: string
}

// --- Interfaces para la API ---
interface ApiItem {
  id: number
  name: string
  quantity: number
  category: string
  image: string
}

interface ApiLevel {
  level_number: number
  items: ApiItem[]
}

interface ApiTrolley {
  id: number
  name: string
  levels: ApiLevel[]
}

// --- Lógica del Componente ---

const getEmojiForCategory = (category: string): string => {
  const cat = category.toLowerCase()
  if (cat.includes("bebida")) return "🥤"
  if (cat.includes("caliente")) return "☕"
  if (cat.includes("snack")) return "🍟"
  if (cat.includes("utensilio")) return "🍴"
  return "📦"
}

export default function TrolleyManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [placementStatus, setPlacementStatus] = useState<"correct" | "incorrect" | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const TROLLEY_ID = 1
  const API_URL = "http://172.191.94.124:8000/api"

  useEffect(() => {
    const fetchTrolleyData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Iniciando fetch a:', `${API_URL}/trolleys/${TROLLEY_ID}/`)
        
        const response = await fetch(`${API_URL}/trolleys/${TROLLEY_ID}/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })
        
        console.log('Respuesta recibida:', response.status, response.statusText)
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }
        const data: ApiTrolley = await response.json()

        const flattenedProducts: Product[] = data.levels.flatMap((level) =>
          level.items.map((item) => ({
            id: item.id.toString(),
            name: item.name,
            quantity: item.quantity,
            category: item.category,
            correctSlot: level.level_number,
            placed: 0,
            imageUrl: item.image,
          }))
        )

        setProducts(flattenedProducts)
      } catch (e: any) {
        setError(e.message || "No se pudo conectar con la API.")
      } finally {
        setLoading(false)
      }
    }

    fetchTrolleyData()
  }, [])

  const currentProduct = products[currentProductIndex]

  const simulatePlacement = (isCorrect: boolean) => {
    if (!currentProduct || isComplete || placementStatus) return

    setPlacementStatus(isCorrect ? "correct" : "incorrect")
    setTimeout(() => setPlacementStatus(null), 400)

    if (isCorrect) {
      const newPlaced = currentProduct.placed + 1
      const newProducts = products.map((p) => (p.id === currentProduct.id ? { ...p, placed: newPlaced } : p))
      const updatedProduct = newProducts.find((p) => p.id === currentProduct.id)
      setProducts(newProducts)

      if (updatedProduct && updatedProduct.placed >= updatedProduct.quantity) {
        setTimeout(() => {
          if (currentProductIndex < products.length - 1) {
            setCurrentProductIndex(currentProductIndex + 1)
          } else {
            setIsComplete(true)
          }
        }, 500)
      }
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c") simulatePlacement(true)
      else if (e.key.toLowerCase() === "i") simulatePlacement(false)
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentProduct, isComplete, placementStatus])

  const handleReset = () => {
    setProducts(products.map((p) => ({ ...p, placed: 0 })))
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
}