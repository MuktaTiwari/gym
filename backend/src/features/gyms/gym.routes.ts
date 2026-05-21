import { Router } from "express";
import { GymController, logoUpload } from "./gym.controller";
import { verifyJWT } from "../../middleware/auth.middleware";

const router = Router();
const gymController = new GymController();

// All gym routes require authentication
router.use(verifyJWT as any);

// ── Gym Profile ──────────────────────────────────────────────────────────────
router.get("/profile", gymController.getProfile as any);
router.patch("/profile", gymController.updateProfile as any);
router.patch("/profile/logo", logoUpload.single("logo"), gymController.uploadLogo as any);

// ── Gym Settings (Theme / Branding) ─────────────────────────────────────────
router.get("/settings", gymController.getSettings as any);
router.patch("/settings", gymController.updateSettings as any);
router.patch("/settings/branding", gymController.updateSettings as any);  // alias

// ── Staff Management ─────────────────────────────────────────────────────────
router.get("/staff", gymController.getStaff as any);
router.post("/staff/invite", gymController.inviteStaff as any);
router.delete("/staff/:staffId", gymController.removeStaff as any);
router.patch("/staff/:staffId/role", gymController.changeStaffRole as any);

// ── Danger Zone ──────────────────────────────────────────────────────────────
router.delete("/workspace", gymController.deactivateWorkspace as any);
router.post("/reset-all-passwords", gymController.resetAllPasswords as any);
router.get("/export", gymController.exportData as any);

export default router;
