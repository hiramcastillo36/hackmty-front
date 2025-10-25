"use client"

import { useMemo, useState } from "react"
import TrolleyManager from "@/components/trolley-manager"
import { TopBar } from "@/components/top-bar"
import { Badge } from "@/components/ui/badge"

const cabins = [
  { name: "Cabina Turista", code: "Y", description: "Cobertura total de pasajeros" },
  { name: "Cabina Ejecutiva", code: "J", description: "Experiencia premium y menú extendido" },
  { name: "Premium Economy", code: "W", description: "Configuración híbrida de confort" },
  { name: "Tripulación / Galley", code: "C", description: "Inventario exclusivo para crew" },
]

const TROLLEYS_PER_CABIN = 3
const TRAYS_PER_TROLLEY = 4

export default function TrolleyPage() {
  const [cabinIndex, setCabinIndex] = useState(0)
  const [trolleyNumber, setTrolleyNumber] = useState(1)
  const [trayNumber, setTrayNumber] = useState(1)

  const currentCabin = cabins[cabinIndex]
  const selectionKey = useMemo(
    () => `${currentCabin.code}-${trolleyNumber}-${trayNumber}`,
    [currentCabin.code, trolleyNumber, trayNumber],
  )

  const summaryLabel = `${currentCabin.name} · Trolley ${trolleyNumber} · Bandeja ${trayNumber}`

  const handleCabinChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextIndex = Number(event.target.value)
    setCabinIndex(nextIndex)
    setTrolleyNumber(1)
    setTrayNumber(1)
  }

  const handleTrolleyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTrolleyNumber(Number(event.target.value))
    setTrayNumber(1)
  }

  const handleTrayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTrayNumber(Number(event.target.value))
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <TopBar tag="Trolley Manager" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
        <section className="rounded-3xl border border-border bg-card/70 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.08)]">
          <p className="text-xs uppercase tracking-[0.5em] text-muted-foreground">Configuracion</p>
          <h1 className="mt-2 text-3xl font-semibold">Selecciona la cabina, el trolley y la bandeja a gestionar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este flujo reproduce el simulador original; cada combinación se maneja de forma independiente.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Selector
              label="Paso 1 · Cabina"
              value={String(cabinIndex)}
              onChange={handleCabinChange}
              options={cabins.map((cabin, index) => ({ label: cabin.name, value: String(index) }))}
            />
            <Selector
              label="Paso 2 · Trolley"
              value={String(trolleyNumber)}
              onChange={handleTrolleyChange}
              options={Array.from({ length: TROLLEYS_PER_CABIN }).map((_, index) => ({
                label: `Trolley ${index + 1}`,
                value: String(index + 1),
              }))}
            />
            <Selector
              label="Paso 3 · Bandeja"
              value={String(trayNumber)}
              onChange={handleTrayChange}
              options={Array.from({ length: TRAYS_PER_TROLLEY }).map((_, index) => ({
                label: `Bandeja ${index + 1}`,
                value: String(index + 1),
              }))}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Instancia seleccionada</p>
              <h2 className="text-xl font-semibold">{summaryLabel}</h2>
              <p className="text-sm text-muted-foreground">{currentCabin.description}</p>
            </div>
            <Badge variant="outline" className="text-xs uppercase tracking-[0.4em] text-[#0032a0]">
              {currentCabin.code}
            </Badge>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-[0_20px_70px_rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Simulacion activa</p>
              <h3 className="text-2xl font-semibold">{summaryLabel}</h3>
              <p className="text-sm text-muted-foreground">
                Usa la matriz de slots para colocar productos; los estados verde/rojo se conservan como antes.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <TrolleyManager key={selectionKey} />
          </div>
        </section>
      </div>
    </main>
  )
}

interface SelectorProps {
  label: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  options: { label: string; value: string }[]
}

function Selector({ label, value, onChange, options }: SelectorProps) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm font-medium shadow-inner focus:border-[#0032a0] focus:outline-none focus:ring-2 focus:ring-[#0032a0]/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
