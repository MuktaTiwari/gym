import { Request, Response, NextFunction } from "express";
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

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce((res: Record<string, string>, item) => {
    const parts = item.split("=");
    const key = parts[0].trim();
    const val = parts.slice(1).join("=").trim();
    res[key] = val;
    return res;
  }, {});
};

export const verifyJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized: Access token is missing");
    }

    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET!) as any as {
      _id: string;
      role: string;
      gymId?: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    next(new ApiError(401, "Unauthorized: Invalid access token"));
  }
};
