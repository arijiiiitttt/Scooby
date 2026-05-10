import { runAudit } from "./ai/ai.service.js";
import type { AuditReport } from "../types/audit.types.js";

const auditCache = new Map<string, AuditReport>();

export async function performAudit(input: {
  programId?: string;
  code?: string;
  provider?: string;
  apiKey?: string;
}): Promise<AuditReport> {
  if (!input.programId && !input.code) {
    throw new Error("Either programId or code must be provided");
  }

  // Basic rate-check: same programId within 60s returns cached result
  // Skip cache when a user-supplied key is present (they want a fresh result)
  if (input.programId && !input.apiKey) {
    const cached = auditCache.get(input.programId);
    if (cached && Date.now() - cached.timestamp < 60_000) {
      console.log(`[Audit] Returning cached result for ${input.programId}`);
      return cached;
    }
  }

  const report = await runAudit({
    programId: input.programId,
    code: input.code,
    provider: input.provider,
    apiKey: input.apiKey,
  });

  if (input.programId) {
    auditCache.set(input.programId, report);
  }

  return report;
}

export function getAuditById(id: string): AuditReport | undefined {
  for (const report of auditCache.values()) {
    if (report.id === id) return report;
  }
  return undefined;
}

export function updateAuditReport(id: string, updates: Partial<AuditReport>): void {
  for (const [key, report] of auditCache.entries()) {
    if (report.id === id) {
      auditCache.set(key, { ...report, ...updates });
      return;
    }
  }
}
