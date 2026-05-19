import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { Role, Roles } from "../enums/roles.enum";
import { ApiError } from "../utils/ApiError";

export const requireRole = (...roles: Roles[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized: Authentication required"));
    }

    // Convert the numeric enums to their string representation in Roles (e.g. Roles.GYM_OWNER -> "GYM_OWNER")
    const roleNames = roles.map((r) => Roles[r] as string);

    if (!roleNames.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Forbidden: You do not have permission to access this resource. Required one of: ${roleNames.join(", ")}`
        )
      );
    }

    next();
  };
};

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized: Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return next(
        new ApiError(
          403,
          `Forbidden: You do not have permission to access this resource. Required one of: ${allowedRoles.join(", ")}`
        )
      );
    }

    next();
  };
};

