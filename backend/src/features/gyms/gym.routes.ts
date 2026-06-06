import { Router } from "express";
import { GymController, logoUpload } from "./gym.controller";
import { verifyJWT } from "../../middleware/auth.middleware";

const router = Router();
const gymController = new GymController();

router.use(verifyJWT);

// ── Gym Profile ──────────────────────────────────────────────────────────────
router.get("/profile", gymController.getProfile);
router.patch("/profile", gymController.updateProfile);
router.patch("/profile/logo", logoUpload.single("logo"), gymController.uploadLogo);

// ── Gym Settings (Theme / Branding) ─────────────────────────────────────────
router.get("/settings", gymController.getSettings);
router.patch("/settings", gymController.updateSettings);
router.patch("/settings/branding", gymController.updateSettings);

// ── Staff Management ─────────────────────────────────────────────────────────
router.get("/staff", gymController.getStaff);
router.post("/staff/invite", gymController.inviteStaff);
router.delete("/staff/:staffId", gymController.removeStaff);
router.patch("/staff/:staffId/role", gymController.changeStaffRole);

// ── Danger Zone ──────────────────────────────────────────────────────────────
router.delete("/workspace", gymController.deactivateWorkspace);
router.post("/reset-all-passwords", gymController.resetAllPasswords);
router.get("/export", gymController.exportData);

export default router;
