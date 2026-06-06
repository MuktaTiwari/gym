import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
    gymId?: string;
  };
}

interface JwtPayload {
  _id: string;
  role: string;
  gymId?: string;
}

const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce<Record<string, string>>((res, item) => {
    const parts = item.split("=");
    const key = parts[0].trim();
    const val = parts.slice(1).join("=").trim();
    res[key] = val;
    return res;
  }, {});
};

export const verifyJWT: RequestHandler = (req, _res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized: Access token is missing");
    }

    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET!) as JwtPayload;
    (req as AuthRequest).user = decoded;
    next();
  } catch {
    next(new ApiError(401, "Unauthorized: Invalid access token"));
  }
};

export const restrictTo = (roles: string[]): RequestHandler => {
  return (req, _res, next) => {
    const authReq = req as AuthRequest;
    if (!authReq.user || !roles.includes(authReq.user.role)) {
      return next(new ApiError(403, "Forbidden: You do not have permission to perform this action"));
    }
    next();
  };
};
