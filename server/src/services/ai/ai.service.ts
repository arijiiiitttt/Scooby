import type { AuditReport } from "../../types/audit.types.js";
import { runClaudeAudit } from "./claude.service.js";
import { runGeminiAudit } from "./gemini.service.js";

/**
 * Smart AI provider selection:
 * 1. Per-request override (provider + apiKey in request body) wins first
 * 2. If AI_PROVIDER is set explicitly in env → use that
 * 3. If only GEMINI_API_KEY is present → use Gemini
 * 4. If only CLAUDE_API_KEY is present → use Claude
 * 5. If both are present → prefer AI_PROVIDER env, fallback to Claude
 * 6. Neither → throw helpful error
 */
function detectProvider(requestProvider?: string): "claude" | "gemini" {
  const explicit = (requestProvider ?? process.env.AI_PROVIDER)?.toLowerCase();
  const hasGemini = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here";
  const hasClaude = !!process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== "your_claude_api_key_here";

  if (explicit === "claude") return "claude";
  if (explicit === "gemini") return "gemini";

  if (hasGemini && hasClaude) {
    console.log("[AI] Both keys present — defaulting to Claude. Set AI_PROVIDER=gemini to override.");
    return "claude";
  }
  if (hasGemini) { console.log("[AI] Auto-detected: Gemini"); return "gemini"; }
  if (hasClaude) { console.log("[AI] Auto-detected: Claude"); return "claude"; }

  throw new Error(
    "No AI API key found.\n" +
    "Set GEMINI_API_KEY or CLAUDE_API_KEY in backend/.env\n" +
    "Get Gemini key: https://aistudio.google.com/app/apikey\n" +
    "Get Claude key: https://console.anthropic.com/settings/keys"
  );
}

export interface RunAuditOptions {
  programId?: string;
  code?: string;
  /** Per-request provider override ('claude' | 'gemini') */
  provider?: string;
  /** Per-request API key — takes precedence over .env keys */
  apiKey?: string;
}

export async function runAudit(options: RunAuditOptions): Promise<AuditReport> {
  const provider = detectProvider(options.provider);
  console.log(`[AI] Provider: ${provider}${options.apiKey ? " (user-supplied key)" : ""}`);

  const input = {
    programId: options.programId,
    code: options.code,
    apiKey: options.apiKey,
  };

  switch (provider) {
    case "claude":  return runClaudeAudit(input);
    case "gemini":  return runGeminiAudit(input);
  }
}

export function getActiveProvider(): string {
  try { return detectProvider(); }
  catch { return "none"; }
}
