<h1 align="center">Scooby</h1>

<p align="center">
    <img src="assets/scooby.png" alt="Scooby Logo" width="200"/>
</p>


<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0-black?color=black&labelColor=black" alt="Version 1.0">
  <img src="https://img.shields.io/badge/License-Apache%202.0-black?color=black&labelColor=black" alt="License Apache 2.0">
  <img src="https://img.shields.io/badge/Network-Solana%20Devnet-black?color=black&labelColor=black" alt="Solana Devnet">
  <img src="https://img.shields.io/badge/Platform-Cross--platform-black?color=black&labelColor=black" alt="Cross-platform">
</p>

<p align="center">
  sniff out vulnerabilities. prove security on-chain. no $50K audit required.
</p>

---

## What is Scooby?
 
> AI-powered smart contract auditing for Solana. Instant. Affordable. Verifiable on-chain.
 
Just like Scooby-Doo uncovers hidden mysteries, Scooby uncovers hidden vulnerabilities inside your smart contracts — before attackers do.
 
Scooby is a decentralized smart contract security platform where developers connect their Phantom wallet, submit Anchor/Rust code, pay a small on-chain fee, and receive an instant AI-powered security audit. For contracts that pass the safety threshold, Scooby mints a verifiable on-chain audit attestation — permanent proof, publicly verifiable by anyone.
 
---
 
## The Problem
 
Smart contract exploits on Solana have caused hundreds of millions in losses. A proper audit from a firm like OtterSec or Halborn costs $20K–$100K and takes weeks. Most hackathon teams and indie builders skip it entirely. Users have no way to know if a protocol is safe.
 
Scooby closes this gap.
 
---
 
## How It Works
 
```
Connect Wallet
     │
     ▼
Submit Contract (paste / upload files / program ID)
     │
     ▼
Pay On-Chain Fee (0.008 SOL)
     │
     ▼
Backend Verifies Payment On-Chain
     │
     ▼
AI Scans for Vulnerabilities (Gemini / Claude)
     │
     ▼
Structured Audit Report Generated
     │
     ▼
Report Saved to Profile History
     │
     ▼
Optional: Mint On-Chain Audit Attestation
```
 
1. **Connect Wallet** — Connect your Phantom wallet. No email, no password. Your wallet is your identity. A profile is created on first connect and your audit history is loaded on return visits.
2. **Submit Your Contract** — Three ways to submit: paste Anchor/Rust code directly, upload multiple `.rs` and `.toml` files (merged automatically client-side), or provide a deployed program ID.
3. **Pay the Audit Fee** — The FeeGate screen appears before anything runs. You pay 0.008 SOL, sign the transaction in your wallet, and the signature is sent to the backend for on-chain verification. Only after confirmation does the audit begin.
4. **AI Security Analysis** — The backend sends your code to Gemini (with Claude as a drop-in alternative) using a structured prompt targeting 13 Solana-specific vulnerability categories. The model returns a JSON report with a score, severity-tagged findings, descriptions, and remediation steps.
5. **Review Your Report** — The frontend renders your security score, vulnerability breakdown by severity, expandable findings with fix recommendations, and total issue count.
6. **Mint On-Chain Badge** — If your score meets the threshold, Scooby creates an attestation account on Solana via the Anchor smart contract. The badge is permanent, publicly verifiable, and composable — other protocols can read it on-chain.
7. **Profile & History** — Every audit is saved to your profile. Return any time to review past reports, scores, fees paid, and badge status.
---
 
## Vulnerabilities Detected
 
| Category | What Scooby Checks |
|---|---|
| Authentication | Missing signer validation, authority mismatches |
| Account Ownership | Unchecked account ownership, invalid constraints |
| PDA Security | Seed collisions, unsafe derivation |
| Arithmetic | Integer overflow, unchecked math |
| CPI Safety | Unsafe cross-program invocation, external call misuse |
| Access Control | Unauthorized state mutation, role bypass |
 
Reports classify every finding as **Critical**, **High**, **Medium**, or **Low**.
 
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | Vite, Bun, React, TypeScript, Tailwind CSS |
| Blockchain | Solana, Anchor Framework |
| Wallet | Phantom, @solana/wallet-adapter-react, @solana/web3.js |
| Backend | Bun, Node.js, Express |
| Database | PostgreSQL (NeonDB) |
| AI | Google Gemini, Anthropic Claude |
| Infrastructure | Helius RPC |
| Auth | Phantom wallet signature |
 
---
 
## Architecture
 
```
Frontend (Vite + Bun)
     │
     ├── Wallet Connect (Phantom)
     │        └── User profile → NeonDB
     │
     ├── Contract Submission
     │        └── Paste / Multi-file upload / Program ID
     │
     ├── Fee Payment → Solana (0.008 SOL to treasury)
     │        └── Verify tx on-chain → Backend
     │
     ├── POST /api/audit → Backend (Express + Bun)
     │        ├── Verify fee payment
     │        ├── AI Analysis (Gemini / Claude)
     │        └── Save report → NeonDB
     │
     └── Mint Badge → Solana Program (Anchor)
                          ├── UserProfile PDA
                          ├── collect_fee instruction
                          ├── Attestation PDA
                          └── On-chain verification
```
 
---
 
## Folder Structure
 
```
scooby/
│
├── frontend/                     # Bun + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── audit/
│       │   │   ├── AuditForm.tsx        # 3-tab input: paste / upload / program ID
│       │   │   ├── AuditReport.tsx      # score ring + expandable findings
│       │   │   ├── FeeGate.tsx          # payment screen before audit runs
│       │   │   └── AuditHistory.tsx     # past audits list
│       │   ├── layout/
│       │   │   ├── Navbar.tsx
│       │   │   └── Footer.tsx
│       │   └── wallet/
│       │       └── WalletConnect.tsx
│       ├── hooks/
│       │   ├── useAudit.ts              # calls /api/audit, manages report state
│       │   ├── useFee.ts                # builds + sends 0.008 SOL payment tx
│       │   ├── useProfile.ts            # fetches profile + history
│       │   └── useWallet.ts             # wallet adapter wrapper
│       └── pages/
│           ├── Home.tsx
│           ├── Audit.tsx                # main flow: form → fee → scan → result
│           ├── Profile.tsx              # dashboard with history and stats
│           └── Verify.tsx              # verify any badge by tx signature
│
├── backend/                      # Bun + Express API
│   └── src/
│       ├── db/
│       │   ├── client.ts                # NeonDB connection
│       │   ├── migrate.ts               # creates all tables
│       │   ├── users.repo.ts            # profile upsert, audit count
│       │   ├── audit.repo.ts            # save + fetch audit history
│       │   └── fees.repo.ts             # log every fee payment
│       ├── services/
│       │   ├── ai/
│       │   │   ├── ai.service.ts        # routes to Gemini or Claude via env var
│       │   │   ├── gemini.service.ts    # active AI provider
│       │   │   └── claude.service.ts    # ready to activate
│       │   └── solana/
│       │       ├── fee.service.ts       # verifies on-chain payment
│       │       └── badge.service.ts     # mints attestation
│       └── routes/
│           ├── audit.route.ts
│           ├── user.route.ts
│           └── badge.route.ts
│
└── contract/                     # Anchor smart contract
    └── programs/scooby/src/
        └── lib.rs                       # UserProfile PDA, collect_fee, Attestation
    └── tests/
        └── scooby.ts                    # 9 tests: happy path + rejection cases
```
 
---
 
## Smart Contract
 
The Anchor program on Solana handles:
 
- **`initialize`** — Sets up the authority account and treasury wallet on-chain
- **`collect_fee`** — Atomically transfers 0.008 SOL to the treasury and increments the user's `UserProfile` PDA. Fee amount is enforced by the program, not the backend.
- **`create_attestation`** — Mints an `Attestation` PDA storing score, findings, timestamp, and user wallet. Requires a prior fee payment.
- **`get_user_profile`** — Permissionless read of any wallet's on-chain audit history
Program is currently deployed on **Solana Devnet**.
 
---
  
## Why Scooby
 
### The Problem with Existing Solutions
 
**Traditional audit firms (OtterSec, Halborn, Neodyme)**
These are the gold standard — but they cost $20K–$100K per audit and take 2–6 weeks. A hackathon team or solo builder cannot access this. Even funded protocols wait months for a slot. The process is manual, slow, and gatekept by price.
 
**Generic static analysis tools (Slither, Mythril)**
Built primarily for EVM. They don't understand Anchor account constraints, PDA derivation, CPI patterns, or Solana's ownership model. Running them on Solana code produces noisy output that misses the vulnerabilities that actually get protocols exploited on Solana.
 
**General AI code review tools**
Not trained or prompted for Solana-specific security patterns. They can spot obvious bugs but miss Solana-native issues like PDA seed collisions, missing account ownership checks, and unsafe CPI authority delegation. They also produce no on-chain proof — just a PDF or a chat response.
 
---
 
### How Scooby is Different
 
**Purpose-built for Solana and Anchor**
Every part of the analysis pipeline — the prompt engineering, the vulnerability categories, the severity classification — is designed specifically around how Anchor programs work. Scooby checks for the exact patterns that have caused real exploits on Solana.
 
**Instant results**
A full audit report is generated in under 30 seconds. No waiting for a firm to schedule you, no back-and-forth, no weeks of delay before launch.
 
**Verifiable on-chain proof**
This is the biggest differentiator. Other tools give you a PDF. Scooby creates a permanent `Attestation` PDA on Solana that anyone can verify — users, investors, aggregators, and even other smart contracts. The trust signal is composable and lives on-chain forever.
 
**Affordable by design**
Scooby charges **0.008 SOL** per audit. Traditional audits cost the equivalent of thousands of SOL. Scooby is priced at ~45% below the effective cost of comparable automated audit infrastructure — low enough that any developer will pay it, sustainable enough to keep the platform running.
 
**Wallet-native, no friction**
No account creation, no email, no subscription setup. Connect Phantom, pay, audit. The entire flow takes under a minute.
 
**Persistent audit history**
Every audit is tied to your wallet and stored permanently. You can track security score improvements across contract iterations, share your history with investors, and demonstrate a security-first development culture.
 
 
**0.008 SOL** is ~45% less than the effective cost of comparable audit infrastructure, keeping the platform sustainable while staying affordable for any builder.
 
---
 
## Getting Started
 
### Prerequisites
 
- Bun
- Node.js 18+
- Rust + Solana CLI
- Anchor CLI
- Phantom Wallet (browser extension)
### Installation
 
```bash
# Clone the repo
git clone https://github.com/yourusername/scooby
cd scooby
 
# Install frontend dependencies
cd frontend
bun install
 
# Install backend dependencies
cd ../backend
bun install
 
# Install contract dependencies + build
cd ../contract
npm install
anchor build
```
 
### Environment Variables
 
**`backend/.env`**
 
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=           # https://aistudio.google.com/app/apikey
CLAUDE_API_KEY=           # https://console.anthropic.com/settings/keys (optional)
HELIUS_API_KEY=           # https://dashboard.helius.dev
DATABASE_URL=             # https://console.neon.tech
SOLANA_NETWORK=devnet
PORT=3000
AUDITOR_PRIVATE_KEY=      # from: cat ~/.config/solana/id.json
TREASURY_WALLET=          # your treasury wallet public key
PROGRAM_ID=               # from: anchor deploy output
```
 
**`frontend/.env`**
 
```env
VITE_API_URL=http://localhost:3000
VITE_HELIUS_API_KEY=      # same as backend
VITE_SOLANA_NETWORK=devnet
VITE_PROGRAM_ID=          # same as backend
VITE_TREASURY_WALLET=     # same as backend
```
 
### Run the Database Migration
 
```bash
cd backend
npm run db:migrate
```
 
### Run Locally
 
```bash
# Terminal 1 — backend
cd backend
bun dev          # http://localhost:3000
 
# Terminal 2 — frontend
cd frontend
bun dev          # http://localhost:5173
```
 
### Deploy the Contract
 
```bash
# Generate + fund wallet
solana-keygen new --outfile ~/.config/solana/id.json
solana config set --url devnet
solana airdrop 2
 
# Build
cd contract
anchor build
 
# Get your program ID
solana address -k target/deploy/scooby-keypair.json
 
# Paste that ID into:
#   contract/Anchor.toml   → scooby = "YOUR_ID"
#   programs/scooby/src/lib.rs → declare_id!("YOUR_ID")
 
# Rebuild + deploy
anchor build && anchor deploy
 
# Run tests (9 total: happy path + rejection cases)
anchor test --skip-local-validator
```
 
---
 
### How the Pricing Works
 
| Tier | Cost | What you get |
|---|---|---|
| Audit | 0.008 SOL | Full AI vulnerability report, severity breakdown, remediation steps, saved to profile |
| On-chain Badge | Included | Attestation PDA minted on Solana, publicly verifiable trust badge |
 
The fee is collected atomically through the Anchor smart contract via the `collect_fee` instruction. This means:
 
- The fee amount is **enforced by the program**, not the backend — no one can manipulate it
- Payment and profile update happen in a **single atomic transaction** — either both succeed or neither does
- The treasury wallet is **stored on-chain** in the authority PDA — fully transparent
- Every fee transaction is **logged on-chain and in NeonDB** — auditable revenue trail
There is no subscription, no free tier, and no hidden cost. One audit, one payment, permanent result.
 
---
 
### Competitive Comparison
 
| | Scooby | Traditional Firms | Slither / Mythril | Generic AI Tools |
|---|---|---|---|---|
| Cost | 0.008 SOL | $20K–$100K | Free but noisy | Free but shallow |
| Speed | ~30 seconds | 2–6 weeks | Minutes | Minutes |
| Solana-specific | ✅ | ✅ | ❌ | ❌ |
| On-chain proof | ✅ | ❌ | ❌ | ❌ |
| Audit history | ✅ | ❌ | ❌ | ❌ |
| Composable badge | ✅ | ❌ | ❌ | ❌ |
| Accessible to all | ✅ | ❌ | ✅ | ✅ |
 
---
 
## Roadmap
 
- [ ] Mainnet deployment
- [ ] Claude as primary AI provider
- [ ] Expanded vulnerability dataset and benchmarking
- [ ] On-chain reputation leaderboard
- [ ] PDF audit export
- [ ] Public audit registry and verification explorer
- [ ] On-chain arbitration DAO for disputed audits
- [ ] Enterprise tier with human review layer
---
 
## Built By
 
**Arijit** — solo founder, Kolkata, India.
Student. Building security infrastructure for the next generation of Solana builders.
 
---


