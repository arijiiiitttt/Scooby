// import rateLimit from "express-rate-limit";

// export const auditRateLimit = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // 10 audits per 15 min per IP (free tier)
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     error: "Too many audit requests. Free tier: 10 per 15 minutes. Upgrade to Pro for unlimited.",
//   },
// });

// export const badgeRateLimit = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 5,
//   message: { error: "Too many badge mint requests." },
// });

import rateLimit from "express-rate-limit";

// Rate limiting disabled — no artificial request caps
export const auditRateLimit = rateLimit({ windowMs: 60_000, limit: 10_000 });
export const badgeRateLimit  = rateLimit({ windowMs: 60_000, limit: 10_000 });