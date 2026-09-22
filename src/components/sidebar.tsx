import Link from "next/link"
import { Activity, LayoutDashboard, Settings, ShieldAlert } from "lucide-react"

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background flex-shrink-0 hidden md:block">
      <div className="flex h-14 items-center border-b px-6">
        <Activity className="h-6 w-6 text-primary mr-2" />
        <span className="font-semibold text-lg tracking-tight">AuditPulse</span>
      </div>
      <nav className="p-4 space-y-2">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-primary bg-primary/10 transition-all hover:text-primary">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link href="/dashboard/endpoints" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <Activity className="h-4 w-4" />
          Endpoints
        </Link>
        <Link href="/dashboard/alerts" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <ShieldAlert className="h-4 w-4" />
          Alerts
        </Link>
        <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </nav>
    </aside>
  )
}
