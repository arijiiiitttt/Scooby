import type { Request, Response } from "express";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { upsertUser } from "../db/users.repo.js";
import { getFeeTransferInfo } from "../services/solana/fee.service.js";

// ── In-memory nonce store (swap for Redis in production) ─────────────────────
// Maps wallet → { nonce, expiresAt }
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── Step 1: Request a nonce challenge ────────────────────────────────────────
// GET /api/auth/nonce?wallet=<base58pubkey>
export async function handleGetNonce(req: Request, res: Response): Promise<void> {
  try {
    const { wallet } = z
      .object({ wallet: z.string().min(32).max(44) })
      .parse(req.query);

    // Validate it's a real Solana pubkey
    try {
      new PublicKey(wallet);
    } catch {
      res.status(400).json({ error: "Invalid wallet address" });
      return;
    }

    const nonce = generateNonce();
    nonceStore.set(wallet, { nonce, expiresAt: Date.now() + NONCE_TTL_MS });

    const message =
      `Sign this message to confirm you own this wallet.\n\nNonce: ${nonce}\n\nThis request will not trigger any blockchain transaction or cost any fees.`;

    res.json({ success: true, nonce, message });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    res.status(500).json({ error: "Failed to generate nonce" });
  }
}

// ── Step 2: Verify signature and log in ──────────────────────────────────────
// POST /api/auth/verify
// Body: { wallet, signature }  (signature = base58-encoded bytes from signMessage)
export async function handleVerifySignature(req: Request, res: Response): Promise<void> {
  try {
    const { wallet, signature } = z
      .object({
        wallet:    z.string().min(32).max(44),
        signature: z.string().min(1),
      })
      .parse(req.body);

    // Look up stored nonce
    const stored = nonceStore.get(wallet);
    if (!stored) {
      res.status(401).json({ error: "No nonce found for this wallet. Request a new one." });
      return;
    }
    if (Date.now() > stored.expiresAt) {
      nonceStore.delete(wallet);
      res.status(401).json({ error: "Nonce expired. Please reconnect your wallet." });
      return;
    }

    // Reconstruct the exact message that was signed
    const message =
      `Sign this message to confirm you own this wallet.\n\nNonce: ${stored.nonce}\n\nThis request will not trigger any blockchain transaction or cost any fees.`;

    // Verify ed25519 signature
    const messageBytes  = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const pubkeyBytes   = new PublicKey(wallet).toBytes();

    const valid = nacl.sign.detached.verify(messageBytes, signatureBytes, pubkeyBytes);
    if (!valid) {
      res.status(401).json({ error: "Signature verification failed. Please try again." });
      return;
    }

    // Consume nonce (one-time use)
    nonceStore.delete(wallet);

    // Upsert user and return session info
    const user    = await upsertUser(wallet);
    const feeInfo = getFeeTransferInfo();

    res.json({ success: true, user, feeInfo });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    res.status(500).json({ error: "Login failed" });
  }
}
