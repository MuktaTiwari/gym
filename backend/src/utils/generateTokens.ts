import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export const generateAccessToken = (userId: string, role: string, gymId?: string): string => {
  const options: SignOptions = { expiresIn: (env.ACCESS_TOKEN_EXPIRY ?? "15m") as SignOptions["expiresIn"] };
  return jwt.sign({ _id: userId, role, gymId }, env.ACCESS_TOKEN_SECRET!, options);
};

export const generateRefreshToken = (userId: string): string => {
  const options: SignOptions = { expiresIn: (env.REFRESH_TOKEN_EXPIRY ?? "7d") as SignOptions["expiresIn"] };
  return jwt.sign({ _id: userId }, env.REFRESH_TOKEN_SECRET!, options);
};
