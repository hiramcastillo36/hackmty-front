import { TopBar } from "@/components/top-bar"

export default function BriefingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <TopBar tag="Briefing" />
      <div className="flex min-h-[calc(100vh-96px)] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">En construccion</p>
        <h1 className="text-3xl font-semibold">Seccion de briefing pendiente</h1>
      </div>
    </main>
  )
}
