"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function AddEndpointModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    method: "GET",
    headers: "{}",
    body: "",
    check_interval_minutes: "5",
    webhook_url: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Unauthenticated")

      // Create or get default project for the user
      let { data: project }: any = await supabase.from("projects").select("id").eq("user_id", session.user.id).limit(1).single()
      
      if (!project) {
        const { data: newProject, error: pError } = await supabase.from("projects").insert({ name: "Default Project", user_id: session.user.id } as any).select().single()
        if (pError) throw pError
        project = newProject
      }

      // Parse headers
      let parsedHeaders = {}
      try {
        parsedHeaders = JSON.parse(formData.headers)
      } catch {
        throw new Error("Headers must be valid JSON")
      }

      let parsedBody = null
      if (formData.body && ["POST", "PUT", "PATCH"].includes(formData.method)) {
        try {
          parsedBody = JSON.parse(formData.body)
        } catch {
          throw new Error("Body must be valid JSON")
        }
      }

      const { error: insertError } = await supabase.from("endpoints").insert({
        user_id: session.user.id,
        project_id: (project as any).id,
        name: formData.name,
        url: formData.url,
        method: formData.method,
        headers: parsedHeaders,
        body: parsedBody,
        check_interval_minutes: parseInt(formData.check_interval_minutes),
        webhook_url: formData.webhook_url || null
      } as any)

      if (insertError) throw insertError

      setIsOpen(false)
      setFormData({
        name: "",
        url: "",
        method: "GET",
        headers: "{}",
        body: "",
        check_interval_minutes: "5",
        webhook_url: ""
      })
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2">
        <Plus className="h-4 w-4" />
        Add Endpoint
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add API Endpoint</DialogTitle>
          <DialogDescription>
            Register a new endpoint for scheduled synthetic testing and schema drift monitoring.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && <div className="text-sm text-destructive font-medium">{error}</div>}
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">Name</label>
            <input required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Stripe Webhook Gateway" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Method</label>
              <select name="method" value={formData.method} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&>option]:text-foreground [&>option]:bg-background">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="grid gap-2 md:col-span-3">
              <label className="text-sm font-medium">URL</label>
              <input required name="url" type="url" value={formData.url} onChange={handleChange} placeholder="https://api.example.com/v1/users" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Headers (JSON)</label>
            <textarea name="headers" value={formData.headers} onChange={handleChange} placeholder='{"Authorization": "Bearer token..."}' rows={3} className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono" />
          </div>

          {["POST", "PUT", "PATCH"].includes(formData.method) && (
            <div className="grid gap-2">
              <label className="text-sm font-medium">Body (JSON)</label>
              <textarea name="body" value={formData.body} onChange={handleChange} placeholder='{"key": "value"}' rows={4} className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono" />
            </div>
          )}

          <div className="grid gap-2">
            <label className="text-sm font-medium">Check Interval</label>
            <select name="check_interval_minutes" value={formData.check_interval_minutes} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&>option]:text-foreground [&>option]:bg-background">
              <option value="5">Every 5 minutes</option>
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="60">Every 1 hour</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Webhook URL (Discord/Slack)</label>
            <input name="webhook_url" type="url" value={formData.webhook_url} onChange={handleChange} placeholder="https://discord.com/api/webhooks/..." className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Endpoint
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
