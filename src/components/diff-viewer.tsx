"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export function DiffViewer({ baseline, current }: { baseline: any, current: any }) {
  if (!baseline || !current) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Baseline Payload</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px] w-full rounded-md border bg-muted/50 p-4">
            <pre className="text-xs text-muted-foreground font-mono">
              {JSON.stringify(baseline, null, 2)}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Current Payload</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px] w-full rounded-md border bg-muted/10 p-4">
            <pre className="text-xs text-foreground font-mono">
              {JSON.stringify(current, null, 2)}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
