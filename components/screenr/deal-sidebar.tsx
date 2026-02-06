"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Upload,
  FileSearch,
  Table2,
  ClipboardCheck,
  Download,
  History,
  ChevronLeft,
  Home,
  FolderKanban,
  Building2,
  Briefcase,
  Sparkles,
} from "lucide-react"

interface DealSidebarProps {
  dealId: string
  dealName: string
}

const navItems = [
  { name: "Uploads", href: "uploads", icon: Upload, step: 1 },
  { name: "Extraction", href: "extraction", icon: FileSearch, step: 2 },
  { name: "Variables", href: "variables", icon: Table2, step: 3 },
  { name: "Checklist", href: "checklist", icon: ClipboardCheck, step: 4 },
  { name: "Export", href: "export", icon: Download, step: 5 },
  { name: "History", href: "history", icon: History, step: 6 },
]

const globalNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dossiers", href: "/", icon: FolderKanban },
  { name: "Deal Room", href: "/deal-room", icon: Briefcase },
  { name: "All Deals", href: "/deals", icon: Building2 },
]

export function DealSidebar({ dealId, dealName }: DealSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname.includes(`/deals/${dealId}/${href}`)
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-sidebar">
      {/* Logo / Brand - links to home */}
      <Link href="/" className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4 transition-colors hover:bg-sidebar-accent/30">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-accent to-accent/70">
          <Sparkles className="h-4 w-4 text-accent-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-primary">Tally R</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">ScreenR</span>
        </div>
      </Link>

      {/* Global Navigation */}
      <div className="border-b border-sidebar-border p-3">
        <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Navigate
        </div>
        <div className="flex flex-wrap gap-1">
          {globalNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                title={item.name}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Current Deal Header */}
      <div className="border-b border-sidebar-border p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Current Deal
        </div>
        <div className="mt-1 truncate text-sm font-medium text-foreground">
          {dealName}
        </div>
      </div>

      {/* Deal Navigation */}
      <nav className="flex-1 p-3">
        <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workflow
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={`/deals/${dealId}/${item.href}`}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
                  )}
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded text-xs font-medium",
                    active ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                  )}>
                    {item.step}
                  </span>
                  <Icon className={cn("h-4 w-4", active ? "text-accent" : "text-muted-foreground")} />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <Link
          href="/deals"
          className="flex items-center gap-2 text-xs text-sidebar-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back to All Deals</span>
        </Link>
      </div>
    </aside>
  )
}
