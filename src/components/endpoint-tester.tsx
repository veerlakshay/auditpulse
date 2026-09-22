"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TypeViewer } from "./type-viewer"
import { DiffViewer } from "./diff-viewer"

export function EndpointTester() {
  const [endpointId, setEndpointId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>("")

  const createMockEndpoint = async () => {
    setIsLoading(true)
    setError("")
    try {
      const { data: project, error: pError }: any = await supabase.from("projects").insert({ name: "Demo Project" } as any).select().single()
      if (pError || !project) throw new Error("Failed to create project")

      const { data: endpoint, error: eError }: any = await supabase.from("endpoints").insert({
        project_id: project.id,
        url: "https://jsonplaceholder.typicode.com/users/1",
        method: "GET",
        webhook_url: "https://example.com/webhook" // Mock webhook
      } as any).select().single()

      if (eError || !endpoint) throw new Error("Failed to create endpoint")

      setEndpointId(endpoint.id)
      
      const { error: sError }: any = await supabase.from("snapshots").insert({
        endpoint_id: endpoint.id,
        status_code: 200,
        latency_ms: 45,
        payload_json: {
          id: 1,
          name: "Leanne Graham",
        }
      } as any)
      if (sError) throw new Error("Failed to create baseline snapshot")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const runCheck = async () => {
    if (!endpointId) return
    setIsLoading(true)
    setError("")
    setResult(null)
    
    try {
      const res = await fetch(`/api/endpoints/${endpointId}/check`, { method: "POST" })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to run check")
      }
      
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="col-span-full xl:col-span-4 mt-6">
      <CardHeader>
        <CardTitle>Interactive Endpoint Tester</CardTitle>
        <CardDescription>Run a synthetic check against an endpoint and analyze schema drift in real-time.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Endpoint UUID" 
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={endpointId}
            onChange={(e) => setEndpointId(e.target.value)}
          />
          <Button onClick={runCheck} disabled={isLoading || !endpointId}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Run Check
          </Button>
        </div>
        
        {!endpointId && (
          <div className="text-sm text-muted-foreground">
            No endpoint? <button onClick={createMockEndpoint} className="text-primary underline">Create a mock endpoint</button> with a baseline snapshot to test drift analysis.
          </div>
        )}

        {error && <div className="text-destructive text-sm">{error}</div>}

        {result && (
          <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
            <div className="flex items-center gap-3">
              <Badge variant={result.snapshot.status_code === 200 ? "default" : "destructive"} className="flex items-center">
                {result.snapshot.status_code === 200 ? <CheckCircle className="mr-1 h-3 w-3" /> : <AlertTriangle className="mr-1 h-3 w-3" />}
                {result.snapshot.status_code}
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                {result.snapshot.latency_ms}ms latency
              </Badge>
              {result.driftAlert?.diff_json?.updatedTypeScriptTypes && (
                <div className="ml-auto">
                  <TypeViewer tsCode={result.driftAlert.diff_json.updatedTypeScriptTypes} />
                </div>
              )}
            </div>

            {result.driftAlert ? (
              <div className="mt-4 p-3 border border-destructive/50 bg-destructive/10 rounded-md">
                <div className="flex items-center gap-2 text-destructive font-semibold mb-2">
                  <ShieldAlert className="h-4 w-4" />
                  Drift Detected! ({result.driftAlert.severity})
                </div>
                <p className="text-sm mb-2">{result.driftAlert.summary}</p>
                <div className="text-xs space-y-1">
                  {result.driftAlert.diff_json.breakingDifferences?.map((diff: string, i: number) => (
                    <div key={i} className="text-destructive/80 font-mono">- {diff}</div>
                  ))}
                  {result.driftAlert.diff_json.securityAnomalies?.map((diff: string, i: number) => (
                    <div key={i} className="text-destructive/80 font-mono">- SECURITY: {diff}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 border border-green-500/30 bg-green-500/10 rounded-md text-green-600 text-sm flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                No schema drift detected compared to baseline.
              </div>
            )}

            {result.baselinePayload && (
              <DiffViewer baseline={result.baselinePayload} current={result.snapshot.payload_json} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
