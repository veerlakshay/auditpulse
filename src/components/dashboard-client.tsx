"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function DashboardCharts({ 
  latencyData, 
  recentDrifts 
}: { 
  latencyData: any[], 
  recentDrifts: any[] 
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Global Latency Trend</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px]">
            {latencyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latencyData}>
                  <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}ms`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="latency" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No latency data available yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Drift Issues</CardTitle>
          <CardDescription>Schema mutations detected recently.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8 max-h-[300px] overflow-y-auto">
            {recentDrifts.length > 0 ? recentDrifts.map((drift) => (
              <div key={drift.id} className="flex items-center">
                <div className="space-y-1 overflow-hidden pr-4">
                  <p className="text-sm font-medium leading-none truncate">{drift.endpoints?.name || drift.endpoints?.url}</p>
                  <p className="text-sm text-muted-foreground truncate" title={drift.summary}>{drift.summary}</p>
                </div>
                <div className="ml-auto font-medium">
                  <Badge variant={drift.severity === 'CRITICAL' ? 'destructive' : drift.severity === 'MEDIUM' ? 'default' : 'outline'}>
                    {drift.severity}
                  </Badge>
                </div>
              </div>
            )) : (
              <div className="text-muted-foreground text-sm">No drift issues detected.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
