import { Router } from "express";
import { PlansController } from "./plans.controller";
import { verifyJWT } from "../../middleware/auth.middleware";

const router = Router();
const plansController = new PlansController();

// All plan routes require authentication
router.use(verifyJWT as any);

router.get("/", plansController.getPlans as any);
router.post("/", plansController.createPlan as any);
router.put("/:id", plansController.updatePlan as any);
router.delete("/:id", plansController.deletePlan as any);

export default router;
