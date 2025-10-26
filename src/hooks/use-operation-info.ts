"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

export interface OperationInfo {
  airline: string
  flight: string
}

const DEFAULT_OPERATION: OperationInfo = { airline: "AEROLINEA", flight: "" }
const STORAGE_KEY = "gate-operation"

export function useOperationInfo() {
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

  return { operation, operationLabel }
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
