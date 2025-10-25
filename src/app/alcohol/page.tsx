import { TopBar } from "@/components/top-bar"

export default function AlcoholModulePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <TopBar tag="Compliance Module" />
      <div className="flex min-h-[calc(100vh-96px)] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Modulo en construccion</p>
        <h1 className="text-3xl font-semibold">Control de bebidas alcoholicas</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Este espacio estara listo para integrar el flujo de autorizaciones, inventarios y reportes especiales.
        </p>
      </div>
    </main>
  )
}
