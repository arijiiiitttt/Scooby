import { GoogleGenerativeAI } from "@google/generative-ai";
import { AUDIT_SYSTEM_PROMPT, buildAuditPrompt } from "../../prompts/audit.prompt.js";
import type { AuditReport, Vulnerability } from "../../types/audit.types.js";
import { v4 as uuidv4 } from "uuid";

const MODEL_CHAIN = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-8b-latest",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseRetryDelay(errMessage: string, defaultMs = 30_000): number {
  const match = errMessage.match(/retry in ([\d.]+)s/i);
  if (match) return Math.ceil(parseFloat(match[1]) * 1000) + 2_000;
  return defaultMs;
}

function isRetryableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("429") ||
    msg.includes("404") ||
    msg.toLowerCase().includes("quota") ||
    msg.toLowerCase().includes("too many requests") ||
    msg.toLowerCase().includes("not found")
  );
}

async function generateWithRetry(
  genAI: GoogleGenerativeAI,
  modelName: string,
  userPrompt: string,
  maxRetries = 1
): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: AUDIT_SYSTEM_PROMPT,
      });
      const result = await model.generateContent(userPrompt);
      return result.response.text();
    } catch (err) {
      const isLast = attempt === maxRetries;
      if (isRetryableError(err) && !isLast) {
        const delay = parseRetryDelay(err instanceof Error ? err.message : "", 30_000);
        console.warn(`[Gemini] ${modelName} quota hit — waiting ${delay}ms then retrying (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }
  throw new Error(`[Gemini] ${modelName} failed after ${maxRetries} retries`);
}

// ── Static fallback analyser ────────────────────────────────────────────────
// Semantic-aware pattern checks that catch real Solana/Anchor vulnerabilities.
// Each check looks at the actual code structure, not just keyword presence.

interface StaticCheck {
  id: string;
  title: string;
  severity: Vulnerability["severity"];
  description: string;
  recommendation: string;
  // Returns the matched location string if vulnerable, null if clean
  detect: (code: string) => string | null;
}

const STATIC_CHECKS: StaticCheck[] = [
  {
    id: "S-001",
    title: "Missing signer check on privileged instruction",
    severity: "critical",
    description:
      "Instructions that modify balances, ownership, or state do not validate that the caller has signed the transaction. Any account can be passed as the authority without proof of ownership.",
    recommendation:
      "Add `#[account(signer)]` or `Signer<'info>` to all authority accounts. In raw Anchor use `constraint = authority.key() == expected_authority.key()` combined with signer validation.",
    detect(code) {
      // Extract each Accounts context struct and check if mutating ones lack a Signer field
      const mutatingStructs = ['Withdraw', 'Transfer', 'Burn', 'Update', 'Remove', 'Delete', 'Close', 'Drain'];
      for (const name of mutatingStructs) {
        const re = new RegExp(`struct\\s+${name}[^{]*\\{([^}]*(?:\\{[^}]*\\}[^}]*)*)\\}`, 's');
        const m = code.match(re);
        if (m && !/Signer\s*</.test(m[1])) {
          return `${name} accounts struct — no Signer field`;
        }
      }
      return null;
    },
  },
  {
    id: "S-002",
    title: "No authority validation on vault / state account",
    severity: "critical",
    description:
      "Vault or state accounts have no authority field checked against the signer. Any caller can invoke privileged instructions because the program never compares the authority key to an expected value.",
    recommendation:
      "Add an `authority: Pubkey` field to your state account and enforce `constraint = vault.authority == authority.key()` in the Anchor account context.",
    detect(code) {
      const hasVault = /struct\s+\w*(Vault|Pool|Treasury|State)\w*\s*\{/i.test(code);
      const hasAuthorityCheck = /\.authority\s*==|has_one\s*=\s*authority|constraint.*authority/i.test(code);
      if (hasVault && !hasAuthorityCheck) return "Vault/State struct definition";
      return null;
    },
  },
  {
    id: "S-003",
    title: "Unchecked arithmetic — overflow / underflow risk",
    severity: "high",
    description:
      "Direct `+=` and `-=` operators are used on balances or amounts without overflow protection. In Rust release builds integer overflow wraps silently on some targets and panics on others, making behaviour undefined.",
    recommendation:
      "Replace `a += b` with `a = a.checked_add(b).ok_or(ErrorCode::Overflow)?` and similarly for subtraction. Enable `overflow-checks = true` in `Cargo.toml` `[profile.release]`.",
    detect(code) {
      // Look for += or -= on balance/amount/lamport fields
      const match = code.match(/\b(balance|amount|lamports|total|supply|deposit|shares)\s*[\+\-]=/i);
      const hasChecked = /checked_add|checked_sub|checked_mul|saturating_add|saturating_sub/i.test(code);
      if (match && !hasChecked) return match[0].trim();
      return null;
    },
  },
  {
    id: "S-004",
    title: "Unsafe direct lamport manipulation",
    severity: "high",
    description:
      "Lamports are modified directly via `**account.lamports.borrow_mut()` without going through the System Program transfer instruction. This bypasses ownership checks and can corrupt account state.",
    recommendation:
      "Use `system_program::transfer(cpi_ctx, amount)` for all SOL movements. Direct lamport manipulation is only safe in very specific PDA patterns and requires extreme care.",
    detect(code) {
      const hasDirectLamport = /\*\*.*lamports.*borrow_mut\(\)|\.lamports\.borrow_mut\(\)/i.test(code);
      if (hasDirectLamport) return "**account.lamports.borrow_mut()";
      return null;
    },
  },
  {
    id: "S-005",
    title: "Unrestricted withdrawal — anyone can drain funds",
    severity: "critical",
    description:
      "The withdraw instruction does not verify the caller owns the vault. Combined with missing signer checks, this means any account can call withdraw and drain the vault to any destination.",
    recommendation:
      "Gate withdrawals behind: (1) a valid signer, (2) an authority check matching the vault's stored authority, and (3) optionally a timelock or withdrawal limit.",
    detect(code) {
      const hasWithdraw = /fn\s+withdraw/i.test(code);
      // If withdraw exists but no constraint/authority/signer guard is near it
      const hasGuard = /constraint\s*=|has_one|\.is_signer|Signer\s*</i.test(code);
      if (hasWithdraw && !hasGuard) return "fn withdraw";
      return null;
    },
  },
  {
    id: "S-006",
    title: "Fake / mismatched deposit accounting",
    severity: "medium",
    description:
      "The internal balance tracked in the account struct is updated independently from the actual lamport transfer. An attacker can manipulate the recorded balance without moving real SOL, or vice versa.",
    recommendation:
      "Derive the internal balance directly from `account.lamports()` after transfer, or verify the transferred amount matches the recorded delta in the same instruction.",
    detect(code) {
      // Deposit function that updates internal balance AND moves lamports separately
      const hasDeposit = /fn\s+deposit/i.test(code);
      const hasBalanceWrite = /\.(balance|amount|deposits)\s*[\+\-]=/i.test(code);
      const hasTransfer = /system_program::transfer|invoke.*transfer|lamports.*borrow_mut/i.test(code);
      if (hasDeposit && hasBalanceWrite && hasTransfer) return "fn deposit — balance and lamports updated separately";
      return null;
    },
  },
  {
    id: "S-007",
    title: "Missing PDA authority — no bump seed stored",
    severity: "medium",
    description:
      "PDAs are used but the bump seed is not stored in the account, forcing the program to recompute it every call. This costs extra compute and can introduce subtle bugs if seeds change.",
    recommendation:
      "Store `bump: u8` in your account struct and use `seeds::program` with `bump = vault.bump` in constraints to avoid recomputation.",
    detect(code) {
      const hasPda = /seeds\s*=\s*\[/i.test(code);
      const storesBump = /bump\s*:\s*u8|bump\s*=\s*ctx\.bumps/i.test(code);
      if (hasPda && !storesBump) return "PDA seeds declaration";
      return null;
    },
  },
  {
    id: "S-008",
    title: "Raw CPI with unvalidated program address",
    severity: "high",
    description:
      "A CPI (cross-program invocation) is made to a program account that is not checked against a known program ID. An attacker can pass a malicious program in place of the expected one.",
    recommendation:
      "Add `constraint = some_program.key() == expected_program::ID` or use Anchor's typed CPI helpers (e.g. `token::transfer`) which enforce the program ID automatically.",
    detect(code) {
      const hasRawInvoke = /invoke\s*\(|invoke_signed\s*\(/i.test(code);
      const hasAnchorCpi = /CpiContext::new|token::transfer|system_program::transfer/i.test(code);
      if (hasRawInvoke && !hasAnchorCpi) return "invoke() / invoke_signed()";
      return null;
    },
  },
  {
    id: "S-009",
    title: "Account closing without data zeroing",
    severity: "medium",
    description:
      "An account is closed (lamports drained to zero) but its data is not zeroed out. A subsequent transaction in the same block can resurrect the account with stale data — a 'closed account' attack.",
    recommendation:
      "Use Anchor's `close = recipient` constraint which automatically zeros account data. If closing manually, zero all fields before draining lamports.",
    detect(code) {
      const hasManualClose = /\*\*.*lamports.*=\s*0|\.lamports\(\)\s*==\s*0/i.test(code);
      const hasAnchorClose = /close\s*=/i.test(code);
      if (hasManualClose && !hasAnchorClose) return "manual lamport drain to 0";
      return null;
    },
  },
  {
    id: "S-010",
    title: "Clock / timestamp used for security logic",
    severity: "low",
    description:
      "Block timestamp (`Clock::get()`) is used to gate withdrawals, expiry, or other security decisions. Validators can shift timestamps by ±1 slot (~400ms) which may bypass time-based guards.",
    recommendation:
      "Use slot numbers instead of timestamps for on-chain timing where precision matters. If timestamps are necessary, add a tolerance buffer of at least 2 slots.",
    detect(code) {
      const hasClock = /Clock::get\(\)|clock\.unix_timestamp/i.test(code);
      const hasComparison = /unix_timestamp\s*[<>]=?\s*|>=\s*.*unix_timestamp/i.test(code);
      if (hasClock && hasComparison) return "clock.unix_timestamp comparison";
      return null;
    },
  },
];

function buildStaticFallbackReport(input: { programId?: string; code?: string }): AuditReport {
  const code = input.code ?? "";
  const findings: Vulnerability[] = [];

  if (code) {
    for (const check of STATIC_CHECKS) {
      const location = check.detect(code);
      if (location) {
        findings.push({
          id: check.id,
          title: check.title,
          severity: check.severity,
          description: check.description,
          location,
          recommendation: check.recommendation,
        });
      }
    }
  }

  const critical = findings.filter((f) => f.severity === "critical").length;
  const high     = findings.filter((f) => f.severity === "high").length;
  const medium   = findings.filter((f) => f.severity === "medium").length;
  const low      = findings.filter((f) => f.severity === "low").length;

  let score = 85;
  score -= critical * 25;
  score -= high     * 15;
  score -= medium   *  7;
  score -= low      *  3;
  score = Math.max(0, Math.min(100, score));

  const subject = input.programId ? `program ID ${input.programId}` : "the submitted code";

  const summary = code
    ? `Static analysis of ${subject} flagged ${critical} critical, ${high} high, ${medium} medium, and ${low} low severity issue(s). ` +
      `Note: this is a pattern-based scan running in fallback mode (AI quota exhausted). ` +
      `It catches structural vulnerabilities but cannot reason about business logic. ` +
      `For a full semantic audit, add your own Gemini or Claude API key in the provider settings.`
    : `No source code provided for ${subject}. Static analysis requires Rust/Anchor source. Please paste your code and re-run.`;

  return {
    id: uuidv4(),
    programId: input.programId,
    score,
    summary,
    vulnerabilities: findings.length > 0 ? findings : [
      {
        id: "S-000",
        title: "No vulnerability patterns matched",
        severity: "info",
        description:
          code
            ? "The static checker found no matching vulnerability patterns. This does not guarantee safety — add an AI API key for full semantic analysis."
            : "No code was provided.",
        recommendation: "Add your Gemini or Claude API key in the AI Provider settings for a full AI-powered audit.",
      },
    ],
    timestamp: Date.now(),
    aiProvider: "static-fallback",
    badgeMinted: false,
  };
}

// ── Main export ─────────────────────────────────────────────────────────────

export async function runGeminiAudit(input: {
  programId?: string;
  code?: string;
  apiKey?: string;
}): Promise<AuditReport> {
  const apiKey = input.apiKey ?? process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in .env");

  const genAI = new GoogleGenerativeAI(apiKey);
  const userPrompt = buildAuditPrompt(input);

  let rawText: string | null = null;
  let usedModel = MODEL_CHAIN[0];

  for (const modelName of MODEL_CHAIN) {
    try {
      console.log(`[Gemini] Trying model: ${modelName}`);
      rawText = await generateWithRetry(genAI, modelName, userPrompt, 1);
      usedModel = modelName;
      console.log(`[Gemini] Success with model: ${modelName}`);
      break;
    } catch (err) {
      if (isRetryableError(err)) {
        console.warn(`[Gemini] ${modelName} unavailable or quota exhausted — trying next model in chain`);
      } else {
        throw err;
      }
    }
  }

  if (rawText === null) {
    console.warn("[Gemini] All models quota-exhausted — returning static fallback report");
    return buildStaticFallbackReport(input);
  }

  let parsed: { score: number; summary: string; vulnerabilities: Vulnerability[] };

  try {
    const clean = rawText.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(`Gemini returned non-JSON response: ${rawText.slice(0, 200)}`);
  }

  return {
    id: uuidv4(),
    programId: input.programId,
    score: parsed.score,
    summary: parsed.summary,
    vulnerabilities: parsed.vulnerabilities,
    timestamp: Date.now(),
    aiProvider: `gemini (${usedModel})`,
    badgeMinted: false,
  };
}