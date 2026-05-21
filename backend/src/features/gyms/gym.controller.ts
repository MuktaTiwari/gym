import { Response } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { GymService } from "./gym.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/auth.middleware";
import { Role } from "../../enums/roles.enum";

// ─── Multer Upload Config ─────────────────────────────────────────────────────
const uploadDir = path.join(process.cwd(), "uploads", "logos");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-${Date.now()}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new ApiError(400, "Only image files are allowed") as any);
};

export const logoUpload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Controller ───────────────────────────────────────────────────────────────

// S7776: Use Set for membership checks
const ownerAdminRoles = new Set([Role.GYM_OWNER, Role.GYM_ADMIN]);

export class GymController {
  private readonly gymService: GymService;

  constructor() {
    this.gymService = new GymService();
  }

  private requireGymOwnerOrAdmin(req: AuthRequest) {
    if (!req.user?.gymId) throw new ApiError(403, "Forbidden: No gym association");
    if (!ownerAdminRoles.has(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only gym owners and admins can perform this action");
    }
  }

  // ── Profile ──────────────────────────────────────────────────────────────

  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) throw new ApiError(403, "No gym associated");
    const profile = await this.gymService.getProfile(req.user.gymId);
    return res.status(200).json(new ApiResponse(200, profile, "Gym profile retrieved"));
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    this.requireGymOwnerOrAdmin(req);
    const { name, email, phone, address, city, country } = req.body;
    const updated = await this.gymService.updateProfile(req.user!.gymId!, { name, email, phone, address, city, country });
    return res.status(200).json(new ApiResponse(200, updated, "Gym profile updated"));
  });

  uploadLogo = asyncHandler(async (req: AuthRequest, res: Response) => {
    this.requireGymOwnerOrAdmin(req);
    if (!req.file) throw new ApiError(400, "No image file provided");
    const logoPath = `/uploads/logos/${req.file.filename}`;
    const updated = await this.gymService.updateLogo(req.user!.gymId!, logoPath);
    return res.status(200).json(new ApiResponse(200, updated, "Logo uploaded successfully"));
  });

  // ── Settings ─────────────────────────────────────────────────────────────

  getSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) throw new ApiError(403, "No gym associated");
    const settings = await this.gymService.getSettings(req.user.gymId);
    return res.status(200).json(new ApiResponse(200, settings, "Settings retrieved"));
  });

  updateSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    this.requireGymOwnerOrAdmin(req);
    const { theme, primaryColor, fontStyle } = req.body;
    const updated = await this.gymService.updateSettings(req.user!.gymId!, { theme, primaryColor, fontStyle });
    return res.status(200).json(new ApiResponse(200, updated, "Settings saved"));
  });

  // ── Staff ────────────────────────────────────────────────────────────────

  getStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) throw new ApiError(403, "Forbidden");
    const staff = await this.gymService.getStaff(req.user.gymId);
    return res.status(200).json(new ApiResponse(200, staff, "Staff retrieved"));
  });

  inviteStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
    this.requireGymOwnerOrAdmin(req);
    const { email, role } = req.body;
    if (!email || !role) throw new ApiError(400, "Email and role are required");
    const result = await this.gymService.inviteStaff(req.user!.gymId!, email, role, req.user!._id);
    return res.status(201).json(new ApiResponse(201, result, "Staff invited successfully"));
  });

  removeStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
    this.requireGymOwnerOrAdmin(req);
    const result = await this.gymService.removeStaff(req.user!.gymId!, req.params.staffId);
    return res.status(200).json(new ApiResponse(200, result, "Staff member removed"));
  });

  changeStaffRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    this.requireGymOwnerOrAdmin(req);
    const { role } = req.body;
    if (!role) throw new ApiError(400, "Role is required");
    const updated = await this.gymService.changeStaffRole(req.user!.gymId!, req.params.staffId, role);
    return res.status(200).json(new ApiResponse(200, updated, "Role updated"));
  });

  // ── Danger Zone ───────────────────────────────────────────────────────────

  deactivateWorkspace = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== Role.GYM_OWNER) throw new ApiError(403, "Only the gym owner can deactivate the workspace");
    const result = await this.gymService.deactivateWorkspace(req.user!.gymId!);
    return res.status(200).json(new ApiResponse(200, result, "Workspace deactivated"));
  });

  resetAllPasswords = asyncHandler(async (req: AuthRequest, res: Response) => {
    this.requireGymOwnerOrAdmin(req);
    const result = await this.gymService.resetAllMemberPasswords(req.user!.gymId!);
    return res.status(200).json(new ApiResponse(200, result, "Password resets initiated"));
  });

  exportData = asyncHandler(async (req: AuthRequest, res: Response) => {
    this.requireGymOwnerOrAdmin(req);
    const { buffer, filename } = await this.gymService.exportAllData(req.user!.gymId!);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  });
}
