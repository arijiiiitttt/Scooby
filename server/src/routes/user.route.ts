import { Router } from "express";
import {
  handleGetProfile,
  handleGetHistory,
  handleGetFeeInfo,
} from "../controllers/user.controller.js";

// NOTE: wallet login has moved to /api/auth
// Use GET /api/auth/nonce?wallet=<pubkey>  →  POST /api/auth/verify

const router = Router();

router.get("/profile/:wallet", handleGetProfile);    // GET  /api/user/profile/:wallet
router.get("/history/:wallet", handleGetHistory);    // GET  /api/user/history/:wallet
router.get("/fee-info",        handleGetFeeInfo);    // GET  /api/user/fee-info

export default router;
