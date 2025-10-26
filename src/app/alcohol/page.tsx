"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Plane, RefreshCcw, ScanLine } from "lucide-react"
import { TopBar } from "@/components/top-bar"
import { useOperationInfo } from "@/hooks/use-operation-info"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const DEFAULT_AIRLINE_KEY = "aeromexico"

interface PolicyRule {
  maxFill?: number
  action: "Reusar" | "Combinar" | "Desechar" | "Reemplazar por nueva"
  detail: string
}

interface AirlinePolicy {
  code: string
  profile: PolicyRule["action"]
  summary: string
  rules: PolicyRule[]
  fallback: PolicyRule
}

interface BottleTemplate {
  id: string
  label: string
  sku: string
  origin: string
  baseTemperature: number
  category: "spirit" | "wine"
}

interface DetectedBottle extends BottleTemplate {
  fillLevel: number
  temperature: number
  lastSeen: string
}

const AIRLINE_POLICIES: Record<string, AirlinePolicy> = {
  aeromexico: {
    code: "AeroMexico",
    profile: "Reemplazar por nueva",
    summary: "Cabina Premier renueva botellas al final de cada vuelo; nada abierto sube al primer servicio.",
    rules: [
      { maxFill: 0.45, action: "Reemplazar por nueva", detail: "Entre 25% y 45% se baja a tierra y se sube un repuesto frio." },
      {
        maxFill: 0.65,
        action: "Combinar",
        detail: "De 45% a 65% se agrupan sin mezclar y se registran como set doble en el galley trasero.",
      },
    ],
    fallback: { action: "Reusar", detail: "Mas del 65% se reusa tras sanitizar el pico y reinstalar sello termoencogible." },
  },
  volaris: {
    code: "Volaris",
    profile: "Reusar",
    summary: "Modelo punto a punto prioriza reuso controlado siempre que el sello interno siga firme.",
    rules: [
      { maxFill: 0.4, action: "Reusar", detail: "De 25% a 40% permanece en el trolley y se marca como servicio economy." },
      {
        maxFill: 0.6,
        action: "Combinar",
        detail: "De 40% a 60% se agrupa con otra botella del mismo SKU y se suben juntas al siguiente vuelo.",
      },
    ],
    fallback: { action: "Reemplazar por nueva", detail: "Mas del 60% pasa a inventario premium y se cambia por una nueva para uniforme visual." },
  },
  vivaaerobus: {
    code: "VivaAerobus",
    profile: "Combinar",
    summary: "Busca minimizar mermas agrupando botellas compatibles sin mezclar liquidos.",
    rules: [
      {
        maxFill: 0.5,
        action: "Combinar",
        detail: "Entre 25% y 50% se etiqueta como par y se coloca junto a otra botella semi llena.",
      },
      { maxFill: 0.7, action: "Reusar", detail: "De 50% a 70% se reusa inmediatamente en los tramos consecutivos." },
    ],
    fallback: { action: "Reemplazar por nueva", detail: "Mas del 70% se sustituye para asegurar primeras rondas con presentacion completa." },
  },
  interjet: {
    code: "Interjet",
    profile: "Desechar",
    summary: "Protocolos legacy prefieren descartar temprano para mantener percepcion business en cabina mixta.",
    rules: [
      {
        maxFill: 0.35,
        action: "Desechar",
        detail: "De 25% a 35% se declara merma y se destruye en rampa antes de cerrar puertas.",
      },
      {
        maxFill: 0.55,
        action: "Reemplazar por nueva",
        detail: "De 35% a 55% se cambia por repuesto etiquetado para el siguiente turno.",
      },
      {
        maxFill: 0.75,
        action: "Combinar",
        detail: "De 55% a 75% se agrupa sin mezclar; se colocan juntas en la misma charola para servicio turista.",
      },
    ],
    fallback: { action: "Reusar", detail: "Mas del 75% permanece en rota actual tras limpiar el vertedero y aplicar sello nuevo." },
  },
}

const BOTTLE_LIBRARY: BottleTemplate[] = [
  { id: "tequila", label: "Tequila Anejo Reserva", sku: "TEQ-ANJ-750", origin: "Jalisco, MX", baseTemperature: 20, category: "spirit" },
  { id: "whisky", label: "Whisky Highland 12", sku: "WHI-H12-700", origin: "Speyside, UK", baseTemperature: 18, category: "spirit" },
  { id: "vodka", label: "Vodka Artico", sku: "VDK-ARC-1000", origin: "Reikiavik, IS", baseTemperature: 16, category: "spirit" },
  { id: "mezcal", label: "Mezcal Espadin Selecto", sku: "MEZ-ESP-750", origin: "Oaxaca, MX", baseTemperature: 22, category: "spirit" },
  { id: "vino", label: "Vino Tinto Reserva", sku: "VIN-ROB-750", origin: "Valle de Guadalupe, MX", baseTemperature: 18, category: "wine" },
]

export default function AlcoholModulePage() {
  const { operation, operationLabel } = useOperationInfo()
  const [detectedBottle, setDetectedBottle] = useState<DetectedBottle>(() => createSimulatedBottle())
  const [hasScan, setHasScan] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const scanTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const normalizedAirline = normalizeAirline(operation.airline)
  const activePolicy = AIRLINE_POLICIES[normalizedAirline] ?? AIRLINE_POLICIES[DEFAULT_AIRLINE_KEY]
  const fillPercent = Math.round(detectedBottle.fillLevel * 100)

  const universalRule = useMemo<PolicyRule | null>(() => {
    if (detectedBottle.category === "wine") {
      return {
        action: "Desechar",
        detail: "Todo vino abierto se desecha al cierre del vuelo; no regresa al servicio a bordo.",
      }
    }
    if (detectedBottle.fillLevel < 0.25) {
      return {
        action: "Desechar",
        detail: "Menos del 25% se reporta como merma post-vuelo y se envía a destrucción controlada.",
      }
    }
    return null
  }, [detectedBottle])

  const recommendedRule = useMemo(() => {
    if (universalRule) return universalRule
    let rule = resolveRule(activePolicy, detectedBottle.fillLevel)
    if (rule.action === "Reusar" && detectedBottle.fillLevel <= 0.7) {
      rule = {
        action: "Reemplazar por nueva",
        detail: "Para reusar se requiere mas del 70% de liquido; cambia la botella por un repuesto frio.",
      }
    }
    if (detectedBottle.fillLevel > 0.7 && rule.action !== "Desechar") {
      rule = {
        action: "Reusar",
        detail: "Mas del 70% se reusa inmediatamente tras limpiar el vertedero y reinstalar sello.",
      }
    }
    return rule
  }, [activePolicy, detectedBottle.fillLevel, universalRule])

  const policyContextLabel = universalRule ? "Regla post-vuelo" : `Politica ${activePolicy.code}`

  const handleScanBottle = () => {
    if (isScanning) return
    setIsScanning(true)
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current)
    }
    scanTimeout.current = setTimeout(() => {
      setDetectedBottle(createSimulatedBottle())
      setHasScan(true)
      setIsScanning(false)
    }, 900)
  }

  useEffect(() => {
    return () => {
      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current)
      }
    }
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <TopBar
        tag="Compliance Module"
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              <Plane className="h-4 w-4 text-[#0032a0]" />
              {operationLabel}
            </div>
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">Israel</span>
          </div>
        }
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        {!hasScan ? (
          <section className="rounded-3xl border border-border bg-card/80 p-12 text-center shadow-[0_30px_110px_rgba(0,0,0,0.12)]">
            <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0032a0]/10">
                <ScanLine className="h-10 w-10 text-[#0032a0]" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-foreground">Escanea una botella</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Alinea la cámara del trolley con la botella
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                  Se realiza despues de cada vuelo antes de cerrar puertas.
                </p>
              </div>
              <Button
                type="button"
                disabled={isScanning}
                onClick={handleScanBottle}
                className="mt-2 gap-2 rounded-2xl px-6 py-6 text-base font-semibold"
              >
                <RefreshCcw className={`h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
                {isScanning ? "Escaneando..." : "Escanear botella"}
              </Button>
            </div>
          </section>
        ) : (
          <section className="grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-[0_35px_120px_rgba(0,0,0,0.1)] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="mt-1 text-2xl font-semibold">Botella encontrada</h2>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isScanning}
                  onClick={handleScanBottle}
                  className="gap-2 text-sm font-semibold"
                >
                  <RefreshCcw className={`h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
                  {isScanning ? "Escaneando..." : "Escanear de nuevo"}
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetectionStat label="Producto" value={detectedBottle.label} helper={detectedBottle.origin} />
                <DetectionStat label="SKU" value={detectedBottle.sku} helper={`Ultima lectura: ${detectedBottle.lastSeen}`} />
                <DetectionStat label="Temperatura" value={`${detectedBottle.temperature.toFixed(1)} °C`} helper="Ideal 16-22 °C" />
                <DetectionStat label="Líquido estimado" value={`${fillPercent}%`} helper="Precisión del modelo ±3%" />
              </div>

              <FillLevelBar value={fillPercent} />
            </div>

            <div className="rounded-2xl border border-border bg-background/90 p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Respuesta inmediata</p>
              <div className="mt-3 flex items-center gap-3">
                <Badge variant="secondary" className={`rounded-full px-3 py-1 text-xs font-semibold ${actionBadgeClass(recommendedRule.action)}`}>
                  {recommendedRule.action}
                </Badge>
                <span className="text-xs text-muted-foreground">{policyContextLabel}</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold">Aplicar protocolo de {recommendedRule.action.toLowerCase()}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{recommendedRule.detail}</p>
              <p className="mt-4 text-xs text-center text-muted-foreground">
                {actionInstruction(recommendedRule.action)}
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function resolveRule(policy: AirlinePolicy, fillLevel: number) {
  const rule = policy.rules.find((item) => typeof item.maxFill === "number" && fillLevel <= (item.maxFill ?? 0))
  return rule ?? policy.fallback
}

function createSimulatedBottle(): DetectedBottle {
  const template = BOTTLE_LIBRARY[Math.floor(Math.random() * BOTTLE_LIBRARY.length)]
  const fillLevel = Number((Math.random() * 0.7 + 0.15).toFixed(2))
  const temperatureDrift = Number((Math.random() * 4 - 2).toFixed(1))
  const timestamp = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(new Date())

  return {
    ...template,
    fillLevel,
    temperature: Number((template.baseTemperature + temperatureDrift).toFixed(1)),
    lastSeen: timestamp,
  }
}

function normalizeAirline(name?: string) {
  if (!name) return DEFAULT_AIRLINE_KEY
  return name.replace(/\s+/g, "").toLowerCase()
}

function actionBadgeClass(action: PolicyRule["action"]) {
  switch (action) {
    case "Desechar":
      return "border border-rose-200 bg-rose-50 text-rose-600"
    case "Reemplazar por nueva":
      return "border border-amber-200 bg-amber-50 text-amber-600"
    case "Combinar":
      return "border border-blue-200 bg-blue-50 text-blue-600"
    default:
      return "border border-emerald-200 bg-emerald-50 text-emerald-700"
  }
}

function actionInstruction(action: PolicyRule["action"]) {
  switch (action) {
    case "Desechar":
      return "Deposita la botella en bolsa roja, reporta la merma y asegurate de romper el sello antes de desechar."
    case "Reemplazar por nueva":
      return "Sella la botella actual, llevala a rampa y sube el repuesto frio etiquetado para el siguiente servicio."
    case "Combinar":
      return "Agrupa la botella con otra semi llena del mismo SKU; colócalas juntas sin mezclar liquido en la misma charola."
    case "Reusar":
      return "Limpia el vertedero, reinstala un sello termico y regresa la botella al trolley del tramo actual."
    default:
      return ""
  }
}

interface DetectionStatProps {
  label: string
  value: string
  helper?: string
}

function DetectionStat({ label, value, helper }: DetectionStatProps) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  )
}

function FillLevelBar({ value }: { value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
        <span>0%</span>
        <span>{value}%</span>
        <span>100%</span>
      </div>
      <div className="mt-2 h-4 w-full rounded-full bg-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0032a0] via-[#0057c2] to-[#00a6ff] transition-[width] duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

