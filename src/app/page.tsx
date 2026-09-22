"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, ArrowRight, ShieldAlert, Activity, FileJson, Bell } from "lucide-react"
import { simulateDriftAction } from "./actions"
import { TypeViewer } from "@/components/type-viewer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className} width="24" height="24">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
)

const DEFAULT_BASELINE = {
  id: "usr_123",
  username: "lakshay",
  role: "ADMIN",
  email: "lakshay@example.com",
  is_active: true
}

const DEFAULT_MUTATED = {
  id: 123, // Breaking: String -> Number
  username: "lakshay",
  // Missing: role removed
  email: "lakshay@example.com",
  is_active: null, // Breaking: Expected boolean, got null
  internal_db_trace: "Error at line 42..." // Security leak
}

export default function LandingPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleRunPlayground = async () => {
    setIsRunning(true)
    setResult(null)
    const res = await simulateDriftAction(DEFAULT_BASELINE, DEFAULT_MUTATED)
    if (res.success) {
      setResult(res.analysis)
    }
    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      
      <main className="z-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
        
        {/* Hero Section */}
        <Badge variant="outline" className="mb-6 rounded-full px-4 py-1.5 font-medium border-primary/30 bg-primary/5 text-primary">
          AuditPulse v1.0 is now live
        </Badge>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
          Automated API Contract & Drift Sentinel
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
          Register endpoints, run synthetic background checks, and let Gemini AI detect breaking schema mutations, latency regressions, and security leaks before your users do.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-24 w-full justify-center">
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 w-full sm:w-auto text-base">
              Launch Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a href="https://github.com/lakshay/auditpulse" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="h-12 px-8 w-full sm:w-auto text-base">
              <GithubIcon className="mr-2 h-4 w-4" />
              View on GitHub
            </Button>
          </a>
        </div>

        {/* Interactive Playground */}
        <div className="w-full max-w-5xl rounded-xl border bg-card/50 backdrop-blur-sm p-4 md:p-8 text-left mb-24">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Interactive Drift Playground</h2>
              <p className="text-muted-foreground">Test Gemini&apos;s drift detection engine in real-time.</p>
            </div>
            <Button onClick={handleRunPlayground} disabled={isRunning} className="gap-2 shrink-0">
              {isRunning ? <span className="animate-pulse">Analyzing...</span> : <><Play className="h-4 w-4" /> Run Drift Inspection</>}
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-background/50 border-dashed">
              <CardContent className="p-4">
                <div className="font-semibold text-sm mb-2 text-green-400">Baseline (Expected) Payload</div>
                <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
                  {JSON.stringify(DEFAULT_BASELINE, null, 2)}
                </pre>
              </CardContent>
            </Card>
            <Card className="bg-background/50 border-dashed">
              <CardContent className="p-4">
                <div className="font-semibold text-sm mb-2 text-destructive">Current (Mutated) Payload</div>
                <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
                  {JSON.stringify(DEFAULT_MUTATED, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>

          {result && (
            <div className="mt-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 text-destructive font-bold mb-2">
                <ShieldAlert className="h-5 w-5" />
                Drift Detected! (Severity: {result.severity})
              </div>
              <p className="mb-4 text-sm">{result.summary}</p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="font-semibold text-xs text-muted-foreground mb-1 uppercase tracking-wider">Breaking Changes</div>
                  <ul className="space-y-1 text-sm font-mono text-destructive/80">
                    {result.breakingDifferences.map((d: string, i: number) => <li key={i}>- {d}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-xs text-muted-foreground mb-1 uppercase tracking-wider">Security Anomalies</div>
                  <ul className="space-y-1 text-sm font-mono text-destructive/80">
                    {result.securityAnomalies.map((d: string, i: number) => <li key={i}>- {d}</li>)}
                  </ul>
                </div>
              </div>

              {result.updatedTypeScriptTypes && (
                <div className="mt-4 flex items-center justify-between border-t border-destructive/20 pt-4">
                  <div className="text-sm font-medium">Gemini generated an updated TypeScript interface.</div>
                  <TypeViewer tsCode={result.updatedTypeScriptTypes} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feature Bento Box */}
        <div className="grid md:grid-cols-3 gap-6 w-full text-left">
          <Card className="bg-background/60 border-muted">
            <CardContent className="pt-6">
              <Activity className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">Autonomous Cron</h3>
              <p className="text-sm text-muted-foreground">Register endpoints and let our Vercel cron engine health-check them continuously in the background.</p>
            </CardContent>
          </Card>
          <Card className="bg-background/60 border-muted">
            <CardContent className="pt-6">
              <FileJson className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">TypeScript Auto-Gen</h3>
              <p className="text-sm text-muted-foreground">Stop manually updating types. AuditPulse generates exact TypeScript / Zod schemas based on live payload drifts.</p>
            </CardContent>
          </Card>
          <Card className="bg-background/60 border-muted">
            <CardContent className="pt-6">
              <Bell className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">Instant Webhooks</h3>
              <p className="text-sm text-muted-foreground">Receive highly-detailed, color-coded Discord and Slack alerts the exact millisecond a breaking change is detected.</p>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  )
}
