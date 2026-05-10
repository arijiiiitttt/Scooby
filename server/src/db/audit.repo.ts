import { sql } from "./client.js";
import type { AuditReport } from "../types/audit.types.js";

export interface AuditHistoryRow {
  id: string;
  user_id: string;
  wallet: string;
  program_id: string | null;
  score: number;
  summary: string;
  vulnerabilities: any[];
  ai_provider: string;
  badge_minted: boolean;
  badge_tx: string | null;
  fee_paid: string;
  fee_tx: string | null;
  created_at: string;
}

export async function saveAuditHistory(
  wallet: string,
  userId: string,
  report: AuditReport,
  feeTx?: string
): Promise<AuditHistoryRow> {
  const rows = await sql`
    INSERT INTO audit_history
      (id, user_id, wallet, program_id, score, summary, vulnerabilities, ai_provider, fee_paid, fee_tx)
    VALUES (
      ${report.id},
      ${userId},
      ${wallet},
      ${report.programId ?? null},
      ${report.score},
      ${report.summary},
      ${JSON.stringify(report.vulnerabilities)},
      ${report.aiProvider},
      ${0.008},
      ${feeTx ?? null}
    )
    RETURNING *
  `;
  return rows[0] as AuditHistoryRow;
}

export async function getAuditsByWallet(
  wallet: string,
  limit = 20,
  offset = 0
): Promise<AuditHistoryRow[]> {
  const rows = await sql`
    SELECT * FROM audit_history
    WHERE wallet = ${wallet}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as AuditHistoryRow[];
}

export async function getAuditById(id: string): Promise<AuditHistoryRow | null> {
  const rows = await sql`
    SELECT * FROM audit_history WHERE id = ${id} LIMIT 1
  `;
  return (rows[0] as AuditHistoryRow) ?? null;
}

export async function updateBadgeMinted(
  auditId: string,
  badgeTx: string
): Promise<void> {
  await sql`
    UPDATE audit_history
    SET badge_minted = TRUE, badge_tx = ${badgeTx}
    WHERE id = ${auditId}
  `;
}

export async function getAuditStats(wallet: string): Promise<{
  total: number;
  avg_score: number;
  badges_minted: number;
  total_fees: string;
}> {
  const rows = await sql`
    SELECT
      COUNT(*)::int             AS total,
      ROUND(AVG(score))::int    AS avg_score,
      COUNT(*) FILTER (WHERE badge_minted)::int AS badges_minted,
      SUM(fee_paid)::text       AS total_fees
    FROM audit_history
    WHERE wallet = ${wallet}
  `;
  return rows[0] as any;
}
