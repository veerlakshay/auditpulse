import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { runEndpointCheck } from "@/lib/runner";

export async function GET(request: Request) {
  // Verify Cron Secret (for Vercel or external caller)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // We need to fetch endpoints that are due for a check.
    // In PostgreSQL, we can check if last_run_at is null OR if NOW() >= last_run_at + check_interval_minutes
    const { data: endpoints, error } = await supabaseAdmin
      .from("endpoints")
      .select("*");

    if (error) {
      throw error;
    }

    const now = new Date();
    const eligibleEndpoints = endpoints.filter((ep: any) => {
      if (!ep.last_run_at) return true;
      const lastRun = new Date(ep.last_run_at);
      const minutesSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60);
      return minutesSinceLastRun >= ep.check_interval_minutes;
    });

    if (eligibleEndpoints.length === 0) {
      return NextResponse.json({
        totalChecked: 0,
        driftsDetected: 0,
        timestamp: new Date().toISOString(),
        message: "No endpoints due for checking."
      });
    }

    // Execute runEndpointCheck concurrently using allSettled
    const results = await Promise.allSettled(
      eligibleEndpoints.map((ep: any) => runEndpointCheck(ep.id))
    );

    let driftsDetected = 0;
    
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        if (result.value.driftAlert) {
          driftsDetected++;
        }
      } else {
        console.error("Endpoint check failed during cron:", result.reason);
      }
    });

    return NextResponse.json({
      totalChecked: eligibleEndpoints.length,
      driftsDetected,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Cron evaluation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
