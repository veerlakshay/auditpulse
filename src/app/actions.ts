"use server"

import { analyzeSchemaDrift } from "@/lib/gemini"

export async function simulateDriftAction(baseline: any, current: any) {
  try {
    const analysis = await analyzeSchemaDrift(baseline, current, "https://api.example.com/mock")
    return { success: true, analysis }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
