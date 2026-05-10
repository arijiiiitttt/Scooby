import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import auditRoutes from "./src/routes/audit.route.js";
import badgeRoutes from "./src/routes/badge.route.js";
import userRoutes  from "./src/routes/user.route.js";
import authRoutes  from "./src/routes/auth.route.js";
import { auditRateLimit, badgeRateLimit } from "./src/middleware/rateLimit.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

const app  = express();
const PORT = process.env.PORT ?? 4000;

app.use(helmet());
app.use(cors({
  origin: true,  // allow any origin
  credentials: true,
}));
app.use(express.json({ limit: "200kb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    provider: process.env.AI_PROVIDER ?? "gemini",
    network: process.env.SOLANA_NETWORK ?? "devnet",
  });
});

app.use("/api/auth",  authRoutes);                        // ← NEW: wallet sign-in
app.use("/api/audit", auditRateLimit, auditRoutes);
app.use("/api/badge", badgeRateLimit,  badgeRoutes);
app.use("/api/user",  userRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║  AuditAI Backend                      ║
║  http://localhost:${PORT}                ║
║  Provider:  ${(process.env.AI_PROVIDER ?? "gemini").padEnd(10)}           ║
║  Network:   ${(process.env.SOLANA_NETWORK ?? "devnet").padEnd(10)}           ║
║  DB:        NeonDB (PostgreSQL)        ║
╚═══════════════════════════════════════╝
  `);
});