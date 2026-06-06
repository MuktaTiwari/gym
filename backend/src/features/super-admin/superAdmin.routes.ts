import { Router } from "express";
import { SuperAdminController } from "./superAdmin.controller";
import { verifyJWT, restrictTo } from "../../middleware/auth.middleware";
import { Role } from "../../enums/roles.enum";

const router = Router();
const superAdminController = new SuperAdminController();

router.use(verifyJWT);
router.use(restrictTo([Role.SUPER_ADMIN]));

router.get("/dashboard", superAdminController.getDashboardData);
router.post("/gyms", superAdminController.addGym);
router.put("/gyms/:gymId", superAdminController.updateGym);
router.patch("/gyms/:gymId/suspend", superAdminController.suspendGym);

export default router;
