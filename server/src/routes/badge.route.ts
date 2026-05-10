import { Router } from "express";
import { handleMintBadge } from "../controllers/badge.controller.js";

const router = Router();

// POST /api/badge/mint — mint an on-chain attestation badge
router.post("/mint", handleMintBadge);

export default router;
