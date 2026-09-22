import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Activity, ServerCrash, Clock } from "lucide-react"
import { EndpointTester } from "@/components/endpoint-tester"
import { AddEndpointModal } from "@/components/add-endpoint-modal"
import { DashboardCharts } from "@/components/dashboard-client"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch real data from Supabase scoped to the user
  const [{ count: endpointsCount }, alertsResponse, { data: snapshots }, { data: recentDrifts }] = await Promise.all([
    supabase.from("endpoints").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("drift_alerts").select("id, endpoints!inner(user_id)", { count: "exact" }).eq("endpoints.user_id", user.id),
    supabase.from("snapshots").select("*, endpoints!inner(user_id)").eq("endpoints.user_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("drift_alerts").select("*, endpoints!inner(name, url, user_id)").eq("endpoints.user_id", user.id).order("created_at", { ascending: false }).limit(10)
  ])
  const alertsCount = alertsResponse.count || 0;

  // Calculate Average Latency and format chart data
  let avgLatency = 0
  let failedSnapshots = 0
  let latencyData: any[] = []

  if (snapshots && snapshots.length > 0) {
    const total = (snapshots as any[]).reduce((acc: number, curr: any) => acc + curr.latency_ms, 0)
    avgLatency = Math.round(total / snapshots.length)
    failedSnapshots = (snapshots as any[]).filter((s: any) => s.status_code >= 400).length
    
    // Reverse for chronological order in the chart
    latencyData = [...snapshots].reverse().map((s: any) => {
      const d = new Date(s.created_at)
      return {
        time: `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`,
        latency: s.latency_ms
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back. Here is the overview of your API health.</p>
        </div>
        <div>
          <AddEndpointModal />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitored APIs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endpointsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Total registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drift Alerts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{alertsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLatency}ms</div>
            <p className="text-xs text-muted-foreground">Based on last 50 runs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Snapshots</CardTitle>
            <ServerCrash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedSnapshots}</div>
            <p className="text-xs text-muted-foreground">In recent history</p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts latencyData={latencyData} recentDrifts={recentDrifts || []} />

      <EndpointTester />
    </div>
  )
}
