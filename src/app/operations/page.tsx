"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { ReactNode } from "react"
import { ClipboardList, Martini, Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/top-bar"

interface OperationInfo {
  airline: string
  flight: string
}

const DEFAULT_OPERATION: OperationInfo = { airline: "AEROLINEA", flight: "" }
const STORAGE_KEY = "gate-operation"

export default function OperationsPage() {
  const searchParams = useSearchParams()
  const [operation, setOperation] = useState<OperationInfo>(DEFAULT_OPERATION)

  useEffect(() => {
    const airlineParam = searchParams.get("airline")
    const flightParam = searchParams.get("flight")

    if (airlineParam || flightParam) {
      const nextOperation: OperationInfo = {
        airline: formatLabel(airlineParam) ?? DEFAULT_OPERATION.airline,
        flight: formatFlight(flightParam),
      }
      setOperation(nextOperation)
      persistOperation(nextOperation)
      return
    }

    const saved = readStoredOperation()
    if (saved) {
      setOperation(saved)
    }
  }, [searchParams])

  const operationLabel = useMemo(() => {
    return operation.flight ? `${operation.airline} ${operation.flight}` : operation.airline
  }, [operation])

  return (
    <main className="min-h-screen bg-[#f5f7ff] text-slate-900">
      <TopBar
        tag="Gateway Actions"
        rightSlot={
          <div className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            <Plane className="h-4 w-4 text-[#0032a0]" />
            {operationLabel}
          </div>
        }
      />

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-14">
        <div>
          <p className="text-sm uppercase tracking-[0.5em] text-[#0032a0]">Bienvenido</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">
            Selecciona el proceso con el que quieres continuar
          </h1>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          <ActionCard
            title="Registrar inventario de trolleys"
            description="Captura y monitorea el llenado completo del trolley antes del abordaje."
            href="/trolley"
            icon={<ClipboardList className="h-7 w-7 text-[#0032a0]" />}
            cta="Ir a Trolley"
          />
          <ActionCard
            title="Manejar bebidas alcoholicas"
            description="Controla inventario especial, permisos y checklists asociados a alcohol."
            href="/alcohol"
            icon={<Martini className="h-7 w-7 text-[#0032a0]" />}
            cta="Abrir módulo"
          />
        </div>
      </section>
    </main>
  )
}

interface ActionCardProps {
  title: string
  description: string
  href: string
  icon: ReactNode
  cta: string
}

function ActionCard({ title, description, href, icon, cta }: ActionCardProps) {
  return (
    <div className="flex min-h-[360px] flex-col gap-5 rounded-[40px] border border-slate-200 bg-white/95 p-10 shadow-[0_35px_120px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
        {icon}
        Accion
      </div>
      <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
      <p className="flex-1 text-base text-slate-500">{description}</p>
      <Button
        asChild
        className="w-full rounded-2xl bg-[#0032a0] py-6 text-lg font-semibold text-white hover:bg-[#0f45b8]"
      >
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  )
}

function formatLabel(value?: string | null) {
  const cleaned = value?.trim()
  return cleaned && cleaned.length > 0 ? cleaned : undefined
}

function formatFlight(value?: string | null) {
  const cleaned = value?.trim().toUpperCase()
  return cleaned && cleaned.length > 0 ? cleaned : ""
}

function persistOperation(operation: OperationInfo) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(operation))
  } catch {
    // ignore storage errors
  }
}

function readStoredOperation(): OperationInfo | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as OperationInfo
    return {
      airline: parsed.airline || DEFAULT_OPERATION.airline,
      flight: parsed.flight || "",
    }
  } catch {
    return null
  }
}
