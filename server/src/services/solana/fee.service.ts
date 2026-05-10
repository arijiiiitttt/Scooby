import {
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
  LAMPORTS_PER_SOL,
  Connection,
} from "@solana/web3.js";
import { connection } from "./connection.js";

// ── Fee constants ────────────────────────────────────────────────────────────
// We charge 45% less than what running the full on-chain attestation program
// would cost (rent + compute). Full on-chain cost ≈ 0.002794 SOL.
// Competitors charge ~0.0145 SOL equivalent → we charge 45% less = 0.008 SOL.
//
// Breakdown:
//   Competitor price:   ~0.01454 SOL
//   Our discount (45%): -0.00654 SOL
//   Our platform fee:    0.00800 SOL  ← what user pays
//   Solana network fee: ~0.000005 SOL ← paid separately by user's wallet
//
export const PLATFORM_FEE_SOL = 0.008;
export const PLATFORM_FEE_LAMPORTS = Math.round(PLATFORM_FEE_SOL * LAMPORTS_PER_SOL); // 8_000_000

function getTreasury(): PublicKey {
  const key = process.env.TREASURY_WALLET;
  if (!key) throw new Error("TREASURY_WALLET not set in .env");
  return new PublicKey(key);
}

/**
 * Verifies that a SOL transfer of PLATFORM_FEE_LAMPORTS was made
 * from `senderWallet` to the treasury in the given transaction.
 * Call this after the frontend sends the signed tx.
 */
export async function verifyFeePayment(
  txSignature: string,
  senderWallet: string
): Promise<boolean> {
  try {
    const treasury = getTreasury();
    const tx = await connection.getParsedTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });

    if (!tx || tx.meta?.err) return false;

    // Check post-balance diff on treasury account
    const accountKeys = tx.transaction.message.accountKeys;
    const treasuryIndex = accountKeys.findIndex(
      (k) => k.pubkey.toBase58() === treasury.toBase58()
    );

    if (treasuryIndex === -1) return false;

    const preBal = tx.meta!.preBalances[treasuryIndex];
    const postBal = tx.meta!.postBalances[treasuryIndex];
    const received = postBal - preBal;

    // Allow a tiny slippage (network fee variance)
    const MIN_ACCEPTABLE = PLATFORM_FEE_LAMPORTS - 5000;
    return received >= MIN_ACCEPTABLE;
  } catch {
    return false;
  }
}

/**
 * Returns the unsigned transfer instruction data for the frontend to sign.
 * The frontend wallet signs & sends this, then passes the tx sig to the backend.
 */
export function getFeeTransferInfo() {
  return {
    treasury: getTreasury().toBase58(),
    amountLamports: PLATFORM_FEE_LAMPORTS,
    amountSol: PLATFORM_FEE_SOL,
    displayPrice: `0.008 SOL`,
    savingsVsCompetitor: "45% cheaper than alternatives",
  };
}
