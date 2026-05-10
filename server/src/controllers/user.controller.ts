import type { Request, Response } from "express";
import { z } from "zod";
import { getUserByWallet } from "../db/users.repo.js";
import { getAuditsByWallet, getAuditStats } from "../db/audit.repo.js";
import { getFeesByWallet } from "../db/fees.repo.js";

// NOTE: Wallet login/register has moved to /api/auth (auth.controller.ts).
//       Use GET /api/auth/nonce then POST /api/auth/verify for wallet sign-in.

// ── Full profile ─────────────────────────────────────────────────────────────
export async function handleGetProfile(req: Request, res: Response): Promise<void> {
  try {
    const { wallet } = req.params;
    const [user, stats, recentAudits] = await Promise.all([
      getUserByWallet(wallet),
      getAuditStats(wallet),
      getAuditsByWallet(wallet, 50),
    ]);

    if (!user) { res.status(404).json({ error: "Wallet not found. Run an audit first." }); return; }

    res.json({ success: true, user, stats, recentAudits });
  } catch (err) {
    res.status(500).json({ error: "Failed to load profile" });
  }
}

// ── Audit history ─────────────────────────────────────────────────────────────
export async function handleGetHistory(req: Request, res: Response): Promise<void> {
  try {
    const { wallet } = req.params;
    const limit  = Math.min(Number(req.query.limit)  || 20, 50);
    const offset = Number(req.query.offset) || 0;

    const [audits, stats] = await Promise.all([
      getAuditsByWallet(wallet, limit, offset),
      getAuditStats(wallet),
    ]);

    res.json({ success: true, audits, stats, limit, offset });
  } catch (err) {
    res.status(500).json({ error: "Failed to load history" });
  }
}

// ── Fee info (for frontend to build the payment tx) ──────────────────────────
export async function handleGetFeeInfo(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, ...getFeeTransferInfo() });
}
