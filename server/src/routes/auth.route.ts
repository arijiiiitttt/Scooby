import { Router } from "express";
import { handleGetNonce, handleVerifySignature } from "../controllers/auth.controller.js";

const router = Router();

router.get("/nonce",  handleGetNonce);          // GET  /api/auth/nonce?wallet=<pubkey>
router.post("/verify", handleVerifySignature);   // POST /api/auth/verify

export default router;
