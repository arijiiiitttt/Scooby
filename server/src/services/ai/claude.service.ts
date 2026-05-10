import Anthropic from "@anthropic-ai/sdk";
import { AUDIT_SYSTEM_PROMPT, buildAuditPrompt } from "../../prompts/audit.prompt.js";
import type { AuditReport, Vulnerability } from "../../types/audit.types.js";
import { v4 as uuidv4 } from "uuid";

export async function runClaudeAudit(input: {
  programId?: string;
  code?: string;
  apiKey?: string; // optional per-request override
}): Promise<AuditReport> {
  const apiKey = input.apiKey ?? process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY is not set in .env");

  const client = new Anthropic({ apiKey });

  const userPrompt = buildAuditPrompt(input);

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    system: AUDIT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const rawText = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  let parsed: { score: number; summary: string; vulnerabilities: Vulnerability[] };

  try {
    const clean = rawText.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(`Claude returned non-JSON response: ${rawText.slice(0, 200)}`);
  }

  return {
    id: uuidv4(),
    programId: input.programId,
    score: parsed.score,
    summary: parsed.summary,
    vulnerabilities: parsed.vulnerabilities,
    timestamp: Date.now(),
    aiProvider: "claude",
    badgeMinted: false,
  };
}
