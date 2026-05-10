import "dotenv/config";
import { sql } from "./client.js";

async function migrate() {
  console.log("🗄  Running NeonDB migrations...");

  // ── users ──────────────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      wallet        VARCHAR(44) UNIQUE NOT NULL,   -- Solana base58 pubkey
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      last_seen     TIMESTAMPTZ DEFAULT NOW(),
      total_audits  INTEGER DEFAULT 0,
      total_fees_paid NUMERIC(20, 9) DEFAULT 0    -- SOL
    )
  `;

  // ── audit_history ─────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS audit_history (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
      wallet          VARCHAR(44) NOT NULL,
      program_id      VARCHAR(44),                -- nullable if code upload
      score           INTEGER NOT NULL,
      summary         TEXT NOT NULL,
      vulnerabilities JSONB NOT NULL DEFAULT '[]',
      ai_provider     VARCHAR(50) NOT NULL,
      badge_minted    BOOLEAN DEFAULT FALSE,
      badge_tx        VARCHAR(90),                -- Solana tx signature
      fee_paid        NUMERIC(20,9) DEFAULT 0,    -- SOL paid
      fee_tx          VARCHAR(90),                -- fee payment tx sig
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // ── fee_transactions ──────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS fee_transactions (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      wallet        VARCHAR(44) NOT NULL,
      audit_id      UUID REFERENCES audit_history(id) ON DELETE SET NULL,
      amount_sol    NUMERIC(20,9) NOT NULL,       -- 0.008
      amount_lamports BIGINT NOT NULL,            -- 8000000
      tx_signature  VARCHAR(90) NOT NULL UNIQUE,
      status        VARCHAR(20) DEFAULT 'confirmed', -- confirmed | failed
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // ── indexes ───────────────────────────────────────────────────────────────
  // Widen ai_provider in case it was created with VARCHAR(20)
  await sql`ALTER TABLE audit_history ALTER COLUMN ai_provider TYPE VARCHAR(50)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_audit_history_wallet   ON audit_history(wallet)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_history_user     ON audit_history(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_history_created  ON audit_history(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_fee_tx_wallet          ON fee_transactions(wallet)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_wallet           ON users(wallet)`;

  console.log("Migrations complete — tables: users, audit_history, fee_transactions");
}

migrate().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});