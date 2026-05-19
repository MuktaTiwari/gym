import { Response } from "express";
import { MembersService } from "./members.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/auth.middleware";
import { Role } from "../../enums/roles.enum";

export class MembersController {
  private membersService: MembersService;

  constructor() {
    this.membersService = new MembersService();
  }

  getMembers = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.gymId) {
      throw new ApiError(403, "Forbidden: Only Gym staff can view members");
    }
    
    // Only GYM_OWNER, GYM_ADMIN, TRAINER can view members for this gym
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN, Role.TRAINER];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Insufficient privileges");
    }

    const members = await this.membersService.getMembers(req.user.gymId);
    return res.status(200).json(new ApiResponse(200, members, "Members retrieved successfully"));
  });

  getMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.gymId) {
      throw new ApiError(403, "Forbidden");
    }

    const member = await this.membersService.getMember(req.params.id, req.user.gymId);
    if (!member) {
      throw new ApiError(404, "Member not found");
    }

    return res.status(200).json(new ApiResponse(200, member, "Member retrieved successfully"));
  });

  createMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.gymId) {
      throw new ApiError(403, "Forbidden: Only Gym staff can create members");
    }
    
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN, Role.TRAINER];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Insufficient privileges");
    }

    const { name, email, password } = req.body;
    if (!name || !email) {
      throw new ApiError(400, "Name and Email are required");
    }

    const newMember = await this.membersService.createMember(req.body, req.user.gymId);

    return res.status(201).json(new ApiResponse(201, newMember, "Member created successfully"));
  });
}
