import { Router } from "express";
import { PlansController } from "./plans.controller";
import { verifyJWT } from "../../middleware/auth.middleware";

const router = Router();
const plansController = new PlansController();

router.use(verifyJWT);

router.get("/", plansController.getPlans);
router.post("/", plansController.createPlan);
router.get("/:id/stats", plansController.getPlanStats);
router.put("/:id", plansController.updatePlan);
router.delete("/:id", plansController.deletePlan);

export default router;
