export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      endpoints: {
        Row: {
          id: string
          project_id: string
          url: string
          method: string
          headers: Json | null
          auth_token: string | null
          check_interval_minutes: number
          last_run_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          url: string
          method?: string
          headers?: Json | null
          auth_token?: string | null
          check_interval_minutes?: number
          last_run_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          url?: string
          method?: string
          headers?: Json | null
          auth_token?: string | null
          check_interval_minutes?: number
          last_run_at?: string | null
          created_at?: string
        }
      }
      snapshots: {
        Row: {
          id: string
          endpoint_id: string
          status_code: number
          latency_ms: number
          payload_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          endpoint_id: string
          status_code: number
          latency_ms: number
          payload_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          endpoint_id?: string
          status_code?: number
          latency_ms?: number
          payload_json?: Json | null
          created_at?: string
        }
      }
      drift_alerts: {
        Row: {
          id: string
          endpoint_id: string
          severity: string
          summary: string
          diff_json: Json | null
          resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          endpoint_id: string
          severity: string
          summary: string
          diff_json?: Json | null
          resolved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          endpoint_id?: string
          severity?: string
          summary?: string
          diff_json?: Json | null
          resolved?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
