import type { Request, Response } from "express";
import { z } from "zod";
import { performAudit } from "../services/audit.service.js";
import { verifyFeePayment, PLATFORM_FEE_SOL, PLATFORM_FEE_LAMPORTS } from "../services/solana/fee.service.js";
import { upsertUser, incrementUserAudits } from "../db/users.repo.js";
import { saveAuditHistory, getAuditById as getAuditByIdFromDB, updateBadgeMinted } from "../db/audit.repo.js";
import { saveFeeTransaction } from "../db/fees.repo.js";

const AuditRequestSchema = z.object({
  programId:      z.string().optional(),
  code:           z.string().optional(),
  wallet:         z.string().min(32).max(44),
  feeTxSignature: z.string(),
  /** Optional: 'claude' | 'gemini' — lets the frontend choose the provider */
  provider:       z.enum(["claude", "gemini"]).optional(),
  /** Optional: user-supplied API key for the chosen provider */
  apiKey:         z.string().optional(),
}).refine((d) => d.programId || d.code, {
  message: "Either programId or code must be provided",
});

export async function handleAuditRequest(req: Request, res: Response): Promise<void> {
  try {
    const validated = AuditRequestSchema.parse(req.body);

    if (validated.code && validated.code.length > 100_000) {
      res.status(400).json({ error: "Code too large. Max 100KB." });
      return;
    }

    const feeValid = await verifyFeePayment(validated.feeTxSignature, validated.wallet);
    if (!feeValid) {
      res.status(402).json({
        error: "Fee payment not confirmed. Ensure you sent 0.008 SOL to the treasury.",
      });
      return;
    }

    console.log("[Audit] wallet=" + validated.wallet + " programId=" + (validated.programId ?? "code") + " provider=" + (validated.provider ?? "auto"));

    const report = await performAudit({
      programId: validated.programId,
      code: validated.code,
      provider: validated.provider,
      apiKey: validated.apiKey,
    });

    const user = await upsertUser(validated.wallet);
    await saveAuditHistory(validated.wallet, user.id, report, validated.feeTxSignature);
    await saveFeeTransaction({
      wallet: validated.wallet,
      auditId: report.id,
      amountSol: PLATFORM_FEE_SOL,
      amountLamports: PLATFORM_FEE_LAMPORTS,
      txSignature: validated.feeTxSignature,
    });
    await incrementUserAudits(validated.wallet, PLATFORM_FEE_SOL);

    res.json({ success: true, report });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const isAuthError = err.errors.some(
        (e) => e.path.includes("wallet") || e.path.includes("feeTxSignature")
      );
      res.status(isAuthError ? 401 : 400).json({
        error: isAuthError
          ? "Wallet connection and fee payment required to run an audit."
          : err.errors[0].message,
      });
      return;
    }
    console.error("[Audit] Error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
}

export async function handleGetReport(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const row = await getAuditByIdFromDB(id);
    if (!row) { res.status(404).json({ error: "Report not found" }); return; }
    // Reshape DB row into AuditReport shape the client expects
    const report = {
      id: row.id,
      programId: row.program_id ?? undefined,
      score: row.score,
      summary: row.summary,
      vulnerabilities: row.vulnerabilities ?? [],
      timestamp: new Date(row.created_at).getTime(),
      aiProvider: row.ai_provider,
      badgeMinted: row.badge_minted,
      txSignature: row.badge_tx ?? undefined,
    };
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
}

export async function handleUpdateBadge(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { txSignature } = z.object({ txSignature: z.string() }).parse(req.body);
    await updateBadgeMinted(id, txSignature);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update badge status" });
  }
}