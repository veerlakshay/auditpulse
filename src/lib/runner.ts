import { supabaseAdmin } from "./supabase-admin";
import { analyzeSchemaDrift } from "./gemini";
import { dispatchWebhookAlert } from "./alerts";

export async function runEndpointCheck(endpointId: string) {
  // 1. Fetch endpoint details
  const { data: endpoint, error: endpointError }: any = await supabaseAdmin
    .from("endpoints")
    .select("*")
    .eq("id", endpointId)
    .single();

  if (endpointError || !endpoint) {
    throw new Error(`Endpoint not found: ${endpointError?.message}`);
  }

  // 2. Fetch the most recent previous snapshot for comparison
  const { data: latestSnapshot }: any = await supabaseAdmin
    .from("snapshots")
    .select("payload_json")
    .eq("endpoint_id", endpointId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const baselinePayload = latestSnapshot?.payload_json;

  // 3. Dispatch the HTTP request
  const startTime = Date.now();
  let statusCode = 0;
  let payload: unknown = null;
  
  try {
    const headers: Record<string, string> = typeof endpoint.headers === 'object' && endpoint.headers !== null 
      ? (endpoint.headers as Record<string, string>) 
      : {};

    if (endpoint.auth_token) {
      headers["Authorization"] = `Bearer ${endpoint.auth_token}`;
    }

    const fetchOptions: RequestInit = {
      method: endpoint.method,
      headers
    };

    if (endpoint.body && ["POST", "PUT", "PATCH"].includes(endpoint.method.toUpperCase())) {
      fetchOptions.body = typeof endpoint.body === 'string' 
        ? endpoint.body 
        : JSON.stringify(endpoint.body);
    }

    const response = await fetch(endpoint.url, fetchOptions);
    
    statusCode = response.status;
    const textBody = await response.text();
    
    try {
      payload = JSON.parse(textBody);
    } catch {
      payload = { _rawText: textBody };
    }
  } catch (error) {
    statusCode = 500;
    payload = { _error: error instanceof Error ? error.message : "Network Error" };
  }

  const latencyMs = Date.now() - startTime;

  // 4. Save new snapshot
  const { data: newSnapshot, error: snapshotError }: any = await supabaseAdmin
    .from("snapshots")
    .insert({
      endpoint_id: endpointId,
      status_code: statusCode,
      latency_ms: latencyMs,
      payload_json: payload
    } as any)
    .select()
    .single();

  if (snapshotError) {
    console.error("Failed to save snapshot", snapshotError);
  }

  // Update last_run_at
  await (supabaseAdmin.from("endpoints") as any)
    .update({ last_run_at: new Date().toISOString() })
    .eq("id", endpointId);

  // 5. Trigger drift analysis if baseline exists
  let driftAlert = null;
  if (baselinePayload && statusCode >= 200 && statusCode < 300) {
    try {
      const analysis = await analyzeSchemaDrift(baselinePayload, payload, endpoint.url);
      
      if (analysis.hasBreakingChanges || analysis.securityAnomalies.length > 0) {
        const { data: alert }: any = await supabaseAdmin
          .from("drift_alerts")
          .insert({
            endpoint_id: endpointId,
            severity: analysis.severity,
            summary: analysis.summary,
            diff_json: {
              breakingDifferences: analysis.breakingDifferences,
              securityAnomalies: analysis.securityAnomalies,
              updatedTypeScriptTypes: analysis.updatedTypeScriptTypes
            }
          } as any)
          .select()
          .single();
        
        driftAlert = alert;
        
        if (alert && endpoint.webhook_url) {
          await dispatchWebhookAlert(endpoint, newSnapshot, alert);
        }
      }
    } catch (analysisError) {
      console.error("Drift analysis failed", analysisError);
    }
  }

  return {
    snapshot: newSnapshot,
    driftAlert,
    baselinePayload
  };
}
