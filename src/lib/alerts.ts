export async function dispatchWebhookAlert(
  endpoint: any,
  snapshot: any,
  driftAlert: any
) {
  if (!endpoint.webhook_url) return;

  const color = driftAlert.severity === "CRITICAL" ? 16711680 : driftAlert.severity === "MEDIUM" ? 16776960 : 3447003;

  const embed = {
    title: `🚨 API Drift Detected: ${endpoint.url}`,
    color,
    fields: [
      {
        name: "Method",
        value: endpoint.method,
        inline: true
      },
      {
        name: "Status Code",
        value: `${snapshot.status_code}`,
        inline: true
      },
      {
        name: "Latency",
        value: `${snapshot.latency_ms}ms`,
        inline: true
      },
      {
        name: "Severity",
        value: driftAlert.severity,
        inline: true
      },
      {
        name: "Summary",
        value: driftAlert.summary
      }
    ]
  };

  if (driftAlert.diff_json?.breakingDifferences?.length > 0) {
    embed.fields.push({
      name: "Breaking Differences",
      value: driftAlert.diff_json.breakingDifferences.map((d: string) => `- ${d}`).join("\n"),
      inline: false
    });
  }

  if (driftAlert.diff_json?.securityAnomalies?.length > 0) {
    embed.fields.push({
      name: "Security Anomalies",
      value: driftAlert.diff_json.securityAnomalies.map((d: string) => `- ${d}`).join("\n"),
      inline: false
    });
  }

  const payload = {
    username: "AuditPulse Sentinel",
    embeds: [embed]
  };

  try {
    await fetch(endpoint.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Failed to dispatch webhook alert", err);
  }
}
