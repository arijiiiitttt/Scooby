import { Router } from "express";
import { handleAuditRequest, handleGetReport, handleUpdateBadge } from "../controllers/audit.controller.js";

const router = Router();

router.post("/",          handleAuditRequest);   // POST /api/audit
router.get("/:id",        handleGetReport);      // GET  /api/audit/:id
router.patch("/:id/badge",handleUpdateBadge);    // PATCH /api/audit/:id/badge

export default router;
