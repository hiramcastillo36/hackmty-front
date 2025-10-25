"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Plane, ShieldCheck, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/top-bar"

const airlines = ["GateGroup Demo", "AeroMexico", "Volaris", "VivaAerobus", "Interjet", "Aeromar", "Magnicharters"]
const STORAGE_KEY = "gate-operation"

export default function IngresoPage() {
  const router = useRouter()
  const [selectedAirline, setSelectedAirline] = useState(airlines[0])
  const [flightNumber, setFlightNumber] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const buttonLabel = useMemo(() => (submitting ? "Ingresando..." : "Ingresar al hub"), [submitting])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!flightNumber.trim()) {
      setError("Ingresa un numero de vuelo valido.")
      return
    }

    setError("")
    setSubmitting(true)

    const flight = flightNumber.toUpperCase()
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            airline: selectedAirline,
            flight,
          }),
        )
      } catch {
        // ignore storage errors
      }
    }

    const params = new URLSearchParams({
      airline: selectedAirline,
      flight,
    })
    router.push(`/operations?${params.toString()}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#001645] via-[#00256f] to-[#0032a0] text-white">
      <div className="flex min-h-screen flex-col">
        <TopBar tag="Operational Suite" />
        <section className="relative flex flex-1 items-center justify-center px-6 py-12">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-white/10 blur-[100px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute -left-32 bottom-12 h-80 w-80 rounded-full bg-cyan-400/20 blur-[120px]"
              animate={{ scale: [1, 0.9, 1.1, 1], opacity: [0.3, 0.6, 0.4, 0.3] }}
              transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>

          <div className="relative z-10 grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="rounded-[32px] border border-white/20 bg-white/10 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            >
              <h1 className="mt-4 text-4xl font-semibold leading-tight">Configura tu operacion</h1>
              <p className="mt-3 max-w-xl text-base text-white/70">
                Selecciona la aerolinea y el vuelo con el que vas a trabajar. Utilizamos estos datos para alinear el
                flujo operativo y replicar la preparacion real del trolley.
              </p>

              <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wide text-white/90">Aerolinea</label>
                  <div className="relative">
                    <select
                      value={selectedAirline}
                      onChange={(event) => setSelectedAirline(event.target.value)}
                      className="w-full rounded-2xl border border-white/30 bg-white/5 px-4 py-3 text-base font-medium text-white shadow-inner shadow-white/5 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      {airlines.map((airline) => (
                        <option key={airline} value={airline} className="text-slate-900">
                          {airline}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wide text-white/90">Numero de vuelo</label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(event) => setFlightNumber(event.target.value.toUpperCase())}
                    placeholder="AA-1234"
                    className="w-full rounded-2xl border border-white/30 bg-white/5 px-4 py-3 text-lg tracking-wide text-white placeholder-white/60 shadow-inner shadow-white/5 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                {error && <p className="text-sm font-semibold text-yellow-200">{error}</p>}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-white text-lg font-semibold uppercase tracking-[0.4em] text-[#0032a0] hover:bg-slate-100"
                >
                  {buttonLabel}
                </Button>
              </form>
            </motion.div>

            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-[32px] border border-white/10 bg-[#00164a]/70 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-cyan-200">
                <ShieldCheck className="h-5 w-5" />
                Gate Insights
              </div>
              <p className="mt-4 text-lg font-semibold">Vision integral de tu cobertura a bordo</p>
              <p className="mt-2 text-sm text-white/70">
                GateEfficiency sincroniza inventarios, asignaciones y protocolos en un mismo panel operativo.
              </p>
              <div className="mt-8 grid gap-4">
                <InfoCard title="Integridad del Trolley" value="Listo para carga" />
                <InfoCard title="Control de alcohol" value="Procedimiento pendiente" />
                <InfoCard title="Tiempo estimado" value="9 min para despacho" />
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  )
}

function InfoCard({ title, value, highlight = false }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        highlight ? "border-white/40 bg-white/10 text-white" : "border-white/15 bg-white/5 text-white/80"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.3em]">{title}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}
