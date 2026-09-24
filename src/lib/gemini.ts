import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export interface DriftAnalysisResult {
  hasBreakingChanges: boolean;
  severity: "LOW" | "MEDIUM" | "CRITICAL";
  summary: string;
  breakingDifferences: string[];
  securityAnomalies: string[];
  updatedTypeScriptTypes: string;
}

export async function analyzeSchemaDrift(
  baselinePayload: unknown,
  currentPayload: unknown,
  endpointUrl: string
): Promise<DriftAnalysisResult> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          hasBreakingChanges: { type: SchemaType.BOOLEAN, description: "True if there are breaking schema changes or missing required keys." },
          severity: { type: SchemaType.STRING, description: "Severity of the drift. Must be LOW, MEDIUM, or CRITICAL." },
          summary: { type: SchemaType.STRING, description: "A concise summary of the schema drift." },
          breakingDifferences: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "List of breaking differences such as missing keys or type mutations." },
          securityAnomalies: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "List of detected security issues like leaked tokens or stack traces." },
          updatedTypeScriptTypes: { type: SchemaType.STRING, description: "Auto-generated TypeScript interface for the currentPayload." },
        },
        required: ["hasBreakingChanges", "severity", "summary", "breakingDifferences", "securityAnomalies", "updatedTypeScriptTypes"],
      },
    },
  });

  const prompt = `
You are AuditPulse, an API Contract & Drift Sentinel SaaS.
Compare the baseline JSON payload from a previous snapshot against the current JSON payload for the endpoint: ${endpointUrl}.
Detect schema drift (type mutations, breaking key removals) and security anomalies (leaked credentials, stack traces).

Baseline Payload:
${JSON.stringify(baselinePayload, null, 2)}

Current Payload:
${JSON.stringify(currentPayload, null, 2)}

Analyze the differences and return the results matching the required JSON schema.
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  try {
    return JSON.parse(responseText) as DriftAnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini JSON response", responseText);
    throw new Error("Invalid response format from Gemini API");
  }
}
