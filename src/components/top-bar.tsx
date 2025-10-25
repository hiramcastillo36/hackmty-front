import Image from "next/image"
import type { ReactNode } from "react"

interface TopBarProps {
  tag?: string
  rightSlot?: ReactNode
}

export function TopBar({ tag = "Operational Suite", rightSlot }: TopBarProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Image src="/gatefficiency-logo.svg" alt="gatefficiency" width={220} height={52} priority className="h-10 w-auto" />
          <div className="h-8 w-px bg-slate-200" />
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#0032a0]">{tag}</p>
        </div>
        {rightSlot ?? (
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">Israel</span>
        )}
      </div>
    </header>
  )
}
