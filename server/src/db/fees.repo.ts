import { sql } from "./client.js";

export interface FeeTransaction {
  id: string;
  wallet: string;
  audit_id: string | null;
  amount_sol: string;
  amount_lamports: number;
  tx_signature: string;
  status: string;
  created_at: string;
}

export async function saveFeeTransaction(data: {
  wallet: string;
  auditId?: string;
  amountSol: number;
  amountLamports: number;
  txSignature: string;
}): Promise<FeeTransaction> {
  const rows = await sql`
    INSERT INTO fee_transactions
      (wallet, audit_id, amount_sol, amount_lamports, tx_signature, status)
    VALUES (
      ${data.wallet},
      ${data.auditId ?? null},
      ${data.amountSol},
      ${data.amountLamports},
      ${data.txSignature},
      'confirmed'
    )
    RETURNING *
  `;
  return rows[0] as FeeTransaction;
}

export async function getFeesByWallet(wallet: string): Promise<FeeTransaction[]> {
  const rows = await sql`
    SELECT * FROM fee_transactions
    WHERE wallet = ${wallet}
    ORDER BY created_at DESC
  `;
  return rows as FeeTransaction[];
}

export async function getTreasuryStats(): Promise<{
  total_collected_sol: string;
  total_transactions: number;
  unique_users: number;
}> {
  const rows = await sql`
    SELECT
      SUM(amount_sol)::text          AS total_collected_sol,
      COUNT(*)::int                  AS total_transactions,
      COUNT(DISTINCT wallet)::int    AS unique_users
    FROM fee_transactions
    WHERE status = 'confirmed'
  `;
  return rows[0] as any;
}
