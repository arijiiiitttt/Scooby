import { sql } from "./client.js";

export interface User {
  id: string;
  wallet: string;
  created_at: string;
  last_seen: string;
  total_audits: number;
  total_fees_paid: string;
}

export async function upsertUser(wallet: string): Promise<User> {
  const rows = await sql`
    INSERT INTO users (wallet)
    VALUES (${wallet})
    ON CONFLICT (wallet) DO UPDATE
      SET last_seen = NOW()
    RETURNING *
  `;
  return rows[0] as User;
}

export async function getUserByWallet(wallet: string): Promise<User | null> {
  const rows = await sql`
    SELECT * FROM users WHERE wallet = ${wallet} LIMIT 1
  `;
  return (rows[0] as User) ?? null;
}

export async function incrementUserAudits(wallet: string, feeSol: number): Promise<void> {
  await sql`
    UPDATE users
    SET total_audits    = total_audits + 1,
        total_fees_paid = total_fees_paid + ${feeSol},
        last_seen       = NOW()
    WHERE wallet = ${wallet}
  `;
}
