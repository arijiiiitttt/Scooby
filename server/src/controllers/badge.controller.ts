import type { Request, Response } from "express";
import { z } from "zod";
import { mintAuditBadge } from "../services/solana/badge.service.js";
import { getAuditById as getAuditFromDB, updateBadgeMinted } from "../db/audit.repo.js";
import type { AuditReport } from "../types/audit.types.js";

const BadgeMintSchema = z.object({
  reportId: z.string().uuid(),
  recipientAddress: z.string().optional(),
});

export async function handleMintBadge(req: Request, res: Response): Promise<void> {
  try {
    const { reportId, recipientAddress } = BadgeMintSchema.parse(req.body);

    // Always look up from DB — never rely on in-memory cache which dies on restart
    const row = await getAuditFromDB(reportId);
    if (!row) {
      res.status(404).json({ error: "Audit report not found. Run an audit first." });
      return;
    }

    // Already minted — return existing tx
    if (row.badge_minted && row.badge_tx) {
      res.json({
        success: true,
        message: "Badge already minted for this report",
        txSignature: row.badge_tx,
        mint: row.badge_tx,
        explorerUrl: `https://explorer.solana.com/tx/${row.badge_tx}?cluster=devnet`,
      });
      return;
    }

    // Reconstruct the AuditReport shape that mintAuditBadge expects
    const report: AuditReport = {
      id: row.id,
      programId: row.program_id ?? undefined,
      score: row.score,
      summary: row.summary,
      vulnerabilities: row.vulnerabilities,
      timestamp: new Date(row.created_at).getTime(),
      aiProvider: row.ai_provider,
      badgeMinted: row.badge_minted,
      txSignature: row.badge_tx ?? undefined,
    };

    console.log(`[Badge] Minting for report ${reportId}...`);
    const { mint, txSignature } = await mintAuditBadge(report, recipientAddress);

    // Persist badge tx to DB
    await updateBadgeMinted(reportId, txSignature);

    res.json({
      success: true,
      mint,
      txSignature,
      explorerUrl: `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error("[Badge] Error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Badge minting failed",
    });
  }
}