import { APIError, API_BASE_URL } from "../types";
import { getAuthHeaders } from "../utils";

export const AUDIT_API_BASE_URL = API_BASE_URL;

// Honeypot detection data
export interface HoneypotData {
  success: boolean;
  is_honeypot: boolean;
  buy_tax: number;
  sell_tax: number;
  token_symbol: string;
}

// Audit request
export interface AuditRequest {
  address: string;
  chain: string;
  source_code?: string;
  honeypot_data?: HoneypotData;
}

// Vulnerability item in audit response
export interface AuditVulnerability {
  type: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title?: string;
  description: string;
  line?: number;
  recommendation?: string;
}

// Structured audit response from backend
export interface AuditResponse {
  success: boolean;
  timestamp?: string;
  contract?: {
    address: string;
    chain: string;
    chain_name: string;
    name: string;
    symbol: string;
    verified: boolean;
  };
  risk_summary?: {
    score: number;
    level: "critical" | "high" | "medium" | "low";
    verdict: "dangerous" | "risky" | "caution" | "safe";
    one_line: string;
  };
  honeypot_detection?: {
    is_honeypot: boolean;
    buy_tax: number;
    sell_tax: number;
    holders: number;
    risk_level: string;
    reason: string;
  };
  quick_checks?: {
    is_open_source: boolean;
    has_pause_function: boolean;
    has_blacklist: boolean;
    has_mint_function: boolean;
    has_proxy: boolean;
    owner_can_change_tax: boolean;
    max_tx_limit: boolean;
    has_cooldown: boolean;
  };
  vulnerabilities?: {
    critical: Array<{ title: string; description: string }>;
    high: Array<{ title: string; description: string }>;
    medium: Array<{ title: string; description: string }>;
    low: Array<{ title: string; description: string }>;
    info: Array<{ title: string; description: string }>;
  };
  investment_advice?: {
    recommendation: "avoid" | "caution" | "safe_to_invest" | "unknown";
    recommendation_text: string;
    confidence: number;
    reasons: string[];
    warnings: string[];
  };
  // Full AI analysis text (markdown formatted)
  raw_analysis?: string;
  // Legacy fields for compatibility
  risk_level?: "critical" | "high" | "medium" | "low";
  risk_score?: number;
  summary?: string;
  contract_info?: {
    name?: string;
    compiler_version?: string;
    optimization?: boolean;
  };
}

// Source code response
export interface SourceCodeResponse {
  source_code: string;
  contract_name?: string;
  compiler_version?: string;
  abi?: any[];
}

// Honeypot check response
export interface HoneypotCheckResponse {
  success: boolean;
  is_honeypot: boolean;
  buy_tax: number;
  sell_tax: number;
  token_symbol: string;
}

/**
 * Get contract source code (requires authentication)
 */
export const getSourceCode = async (
  chain: string,
  address: string
): Promise<SourceCodeResponse> => {
  const response = await fetch(
    `${AUDIT_API_BASE_URL}/source/${chain}/${address}`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new APIError("Failed to fetch source code", response.status);
  }

  const data = await response.json();

  if (data.status === "error") {
    throw new APIError(data.message || "Failed to fetch source code");
  }

  return data.data || data;
};

/**
 * Check for honeypot (requires authentication)
 */
export const checkHoneypot = async (
  chain: string,
  address: string
): Promise<HoneypotCheckResponse> => {
  const response = await fetch(
    `${AUDIT_API_BASE_URL}/honeypot/${chain}/${address}`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new APIError("Failed to check honeypot", response.status);
  }

  const data = await response.json();

  if (data.status === "error") {
    throw new APIError(data.message || "Honeypot check failed");
  }

  return data.data || data;
};

/**
 * Perform AI audit on smart contract (Sync version - faster)
 * Uses the sync endpoint for direct JSON response
 * Requires authentication - costs 200 points per audit
 */
export const performAudit = async (
  request: AuditRequest
): Promise<AuditResponse> => {
  console.log("[Audit] Using sync API for faster response...");

  const response = await fetch(`${AUDIT_API_BASE_URL}/audit/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new APIError("Audit request failed", response.status);
  }

  const result = await response.json();

  if (!result.success) {
    throw new APIError(result.error || "Audit failed");
  }

  console.log("[Audit] Received structured result from sync API");
  return result as AuditResponse;
};

/**
 * Perform AI audit on smart contract (Streaming version)
 * Handles OpenAI-style SSE streaming responses with final_result
 * Requires authentication - costs 200 points per audit
 */
export const performAuditStreaming = async (
  request: AuditRequest
): Promise<AuditResponse> => {
  const response = await fetch(`${AUDIT_API_BASE_URL}/audit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new APIError("Audit request failed", response.status);
  }

  // Read the streaming response
  const reader = response.body?.getReader();
  if (!reader) {
    throw new APIError("No response body");
  }

  const decoder = new TextDecoder();
  let fullText = "";
  let structuredResult: AuditResponse | null = null;

  // Read all chunks from the stream
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);

    // Parse SSE format: "data: {...}\n\ndata: {...}\n\n..."
    for (const line of chunk.split("\n")) {
      if (line.startsWith("data: ") && line !== "data: [DONE]") {
        try {
          const jsonStr = line.slice(6); // Remove "data: " prefix
          const data = JSON.parse(jsonStr);

          // Check for error
          if (data.error) {
            throw new APIError(data.error);
          }

          // Check for final structured result from backend
          if (data.type === "final_result" && data.result) {
            structuredResult = data.result as AuditResponse;
            console.log("[Audit] Received structured result from backend");
          }

          // OpenAI-style streaming format: {"choices":[{"delta":{"content":"..."}}]}
          const content = data.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
          }
        } catch (e) {
          // Skip invalid JSON lines (but not our thrown errors)
          if (e instanceof APIError) throw e;
        }
      }
    }
  }

  console.log("[Audit] Full response text:", fullText.substring(0, 500) + "...");

  // Use structured result from backend if available, otherwise parse text
  if (structuredResult) {
    return structuredResult;
  }

  // Fallback: parse the accumulated text as structured audit result
  const result = parseAuditResult(fullText);
  return result;
};

/**
 * Parse the AI audit result text into structured format
 */
function parseAuditResult(text: string): AuditResponse {
  // Try to extract JSON if present
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      // Continue to text parsing
    }
  }

  // Parse structured text response
  const vulnerabilities: AuditVulnerability[] = [];
  let summary = "";
  let riskLevel: "critical" | "high" | "medium" | "low" = "low";

  // Extract risk level
  if (text.includes("高风险") || text.includes("严重") || text.toLowerCase().includes("critical")) {
    riskLevel = "critical";
  } else if (text.includes("中高风险") || text.toLowerCase().includes("high")) {
    riskLevel = "high";
  } else if (text.includes("中风险") || text.toLowerCase().includes("medium")) {
    riskLevel = "medium";
  }

  // Extract vulnerabilities from numbered lists or sections
  const vulnPatterns = [
    /(?:漏洞|问题|风险|vulnerability|issue)[\s\S]*?[:：]\s*([^\n]+)/gi,
    /\d+\.\s*\*\*([^*]+)\*\*[:\s]*([^\n]+)/g,
    /#{1,3}\s*(?:漏洞|问题|风险).*?\n([\s\S]*?)(?=\n#{1,3}|$)/gi,
  ];

  // Simple extraction: look for severity keywords
  const severityKeywords = {
    critical: ["严重", "critical", "紧急"],
    high: ["高", "high", "重要"],
    medium: ["中", "medium", "一般"],
    low: ["低", "low", "轻微"],
  };

  // Extract sections that look like vulnerabilities
  const lines = text.split("\n");
  let currentVuln: Partial<AuditVulnerability> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for vulnerability headers (numbered items, bold text, etc.)
    const headerMatch = trimmed.match(/^(?:\d+[\.\)]\s*)?[\*\#]*\s*(.+?)[\*\#]*\s*$/);
    if (headerMatch && (
      trimmed.includes("漏洞") ||
      trimmed.includes("风险") ||
      trimmed.includes("问题") ||
      trimmed.toLowerCase().includes("vulnerability") ||
      trimmed.toLowerCase().includes("risk") ||
      trimmed.toLowerCase().includes("issue")
    )) {
      if (currentVuln && currentVuln.title) {
        vulnerabilities.push(currentVuln as AuditVulnerability);
      }
      currentVuln = {
        type: "security",
        severity: "medium",
        title: headerMatch[1].replace(/[\*\#]/g, "").trim(),
        description: "",
      };

      // Determine severity
      for (const [sev, keywords] of Object.entries(severityKeywords)) {
        if (keywords.some(k => trimmed.toLowerCase().includes(k))) {
          currentVuln.severity = sev as AuditVulnerability["severity"];
          break;
        }
      }
    } else if (currentVuln) {
      // Add to description
      if (trimmed && !trimmed.startsWith("#")) {
        currentVuln.description = (currentVuln.description || "") + " " + trimmed;
      }
    }
  }

  // Don't forget the last vulnerability
  if (currentVuln && currentVuln.title) {
    vulnerabilities.push(currentVuln as AuditVulnerability);
  }

  // Use first part as summary if not extracted
  summary = text.split("\n").slice(0, 3).join(" ").substring(0, 500);

  return {
    risk_level: riskLevel,
    summary: summary.trim(),
    vulnerabilities: vulnerabilities.length > 0 ? vulnerabilities : undefined,
    raw_analysis: text, // Keep the full text for display
  };
}

/**
 * Full audit flow: get source, check honeypot, perform audit
 */
export const performFullAudit = async (
  chain: string,
  address: string,
  manualSourceCode?: string
): Promise<{
  sourceCode: SourceCodeResponse | null;
  honeypot: HoneypotCheckResponse | null;
  audit: AuditResponse;
}> => {
  let sourceCode: SourceCodeResponse | null = null;
  let honeypot: HoneypotCheckResponse | null = null;

  // Try to get source code if not provided
  if (!manualSourceCode) {
    try {
      sourceCode = await getSourceCode(chain, address);
    } catch (error) {
      console.log("Could not fetch source code, will use address only");
    }
  }

  // Check honeypot
  try {
    honeypot = await checkHoneypot(chain, address);
  } catch (error) {
    console.log("Honeypot check failed, continuing without it");
  }

  // Perform audit
  const auditRequest: AuditRequest = {
    address,
    chain,
    source_code: manualSourceCode || sourceCode?.source_code || "",
    honeypot_data: honeypot
      ? {
          success: honeypot.success,
          is_honeypot: honeypot.is_honeypot,
          buy_tax: honeypot.buy_tax,
          sell_tax: honeypot.sell_tax,
          token_symbol: honeypot.token_symbol,
        }
      : undefined,
  };

  const audit = await performAudit(auditRequest);

  return { sourceCode, honeypot, audit };
};
