import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { connection } from "./connection.js";
import type { AuditReport } from "../../types/audit.types.js";

function getAuditorKeypair(): Keypair {
  const raw = process.env.AUDITOR_PRIVATE_KEY;
  if (!raw || raw === "[]") {
    // Generate ephemeral keypair for dev — fund this with devnet SOL
    console.warn("[Badge] No AUDITOR_PRIVATE_KEY set, using ephemeral keypair (devnet only)");
    return Keypair.generate();
  }
  const bytes = JSON.parse(raw) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(bytes));
}

/**
 * Stores audit attestation in a Solana account's memo / data field.
 * In production this calls your deployed Anchor program.
 * For devnet testing we write a memo transaction as proof-of-audit.
 */
export async function mintAuditBadge(
  report: AuditReport,
  recipientAddress?: string
): Promise<{ mint: string; txSignature: string }> {
  const auditor = getAuditorKeypair();

  // Check balance
  const balance = await connection.getBalance(auditor.publicKey);
  if (balance < 5000) {
    throw new Error(
      `Auditor wallet has insufficient SOL. Fund ${auditor.publicKey.toBase58()} on devnet: https://faucet.solana.com`
    );
  }

  const recipient = recipientAddress
    ? new PublicKey(recipientAddress)
    : auditor.publicKey;

  // Badge metadata stored as JSON in memo
  const badgeData = {
    v: 1,
    type: "audit_attestation",
    programId: report.programId ?? "code_audit",
    score: report.score,
    issues: report.vulnerabilities.length,
    critical: report.vulnerabilities.filter((v) => v.severity === "critical").length,
    high: report.vulnerabilities.filter((v) => v.severity === "high").length,
    timestamp: report.timestamp,
    auditor: "AuditAI",
    reportId: report.id,
  };

  // Use memo program to write attestation on-chain
  const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

  const memoInstruction = {
    keys: [{ pubkey: auditor.publicKey, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(JSON.stringify(badgeData)),
  };

  const transaction = new Transaction().add(memoInstruction);

  const signature = await sendAndConfirmTransaction(connection, transaction, [auditor]);

  console.log(`[Badge] Attestation minted: ${signature}`);

  return {
    mint: recipient.toBase58(),
    txSignature: signature,
  };
}
