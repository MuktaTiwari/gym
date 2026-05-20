import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const generateAccessToken = (userId: string, role: string, gymId?: string): string => {
  return jwt.sign(
    { _id: userId, role, gymId },
    env.ACCESS_TOKEN_SECRET!,
    { expiresIn: env.ACCESS_TOKEN_EXPIRY as any }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { _id: userId },
    env.REFRESH_TOKEN_SECRET!,
    { expiresIn: env.REFRESH_TOKEN_EXPIRY as any }
  );
};
