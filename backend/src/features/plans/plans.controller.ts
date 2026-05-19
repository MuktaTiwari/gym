import { Response } from "express";
import { PlansService } from "./plans.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/auth.middleware";
import { Role } from "../../enums/roles.enum";

export class PlansController {
  private plansService: PlansService;

  constructor() {
    this.plansService = new PlansService();
  }

  getPlans = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.gymId) {
      throw new ApiError(403, "Forbidden");
    }

    const plans = await this.plansService.getPlans(req.user.gymId);
    return res.status(200).json(new ApiResponse(200, plans, "Plans retrieved successfully"));
  });

  createPlan = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.gymId) {
      throw new ApiError(403, "Forbidden: Only Gym staff can create plans");
    }

    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Insufficient privileges");
    }

    const { name, price, durationInMonths, type } = req.body;
    if (!name || price === undefined || !durationInMonths || !type) {
      throw new ApiError(400, "Missing required fields");
    }

    const plan = await this.plansService.createPlan(req.body, req.user.gymId);
    return res.status(201).json(new ApiResponse(201, plan, "Plan created successfully"));
  });

  updatePlan = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.gymId) {
      throw new ApiError(403, "Forbidden");
    }

    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Insufficient privileges");
    }

    const plan = await this.plansService.updatePlan(req.params.id, req.user.gymId, req.body);
    if (!plan) {
      throw new ApiError(404, "Plan not found");
    }

    return res.status(200).json(new ApiResponse(200, plan, "Plan updated successfully"));
  });

  deletePlan = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.gymId) {
      throw new ApiError(403, "Forbidden");
    }

    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Insufficient privileges");
    }

    const plan = await this.plansService.deletePlan(req.params.id, req.user.gymId);
    if (!plan) {
      throw new ApiError(404, "Plan not found");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Plan deleted successfully"));
  });
}
