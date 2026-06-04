import { Router } from "express";
import { SuperAdminController } from "./superAdmin.controller";
import { verifyJWT, restrictTo } from "../../middleware/auth.middleware";
import { Role } from "../../enums/roles.enum";

const router = Router();
const superAdminController = new SuperAdminController();

// Protect all routes
router.use(verifyJWT as any);
router.use(restrictTo([Role.SUPER_ADMIN]) as any);

router.get("/dashboard", superAdminController.getDashboardData as any);
router.post("/gyms", superAdminController.addGym as any);
router.put("/gyms/:gymId", superAdminController.updateGym as any);
router.patch("/gyms/:gymId/suspend", superAdminController.suspendGym as any);

export default router;
