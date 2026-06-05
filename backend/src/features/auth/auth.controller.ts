import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";
import { ApiError } from "../../utils/ApiError";
import { env } from "../../config/env";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

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

export class AuthController {
  private readonly  authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler(async (req: Request, res: Response) => { 
    const user = await this.authService.register(req.body);
    return res
      .status(201)
      .json(new ApiResponse(201, user, "User registered successfully"));
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await this.authService.login(email, password);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user, accessToken, refreshToken },
          "User logged in successfully"
        )
      );
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const cookies = req.headers.cookie ? parseCookies(req.headers.cookie) : {};
    const token = cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      throw new ApiError(401, "Refresh token is missing");
    }

    const { accessToken, refreshToken } = await this.authService.refresh(token);

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Token refreshed successfully"
        )
      );
  });

  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }
    
    await this.authService.logout(String(req.user._id));

    return res
      .status(200)
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(200, null, "User logged out successfully"));
  });

  getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await this.authService.getUserProfile(String(req.user._id));
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { user, accessToken: req.header("Authorization")?.replace("Bearer ", "") }, "User details fetched successfully"));
  });

  setPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    if (!token || !password) {
      throw new ApiError(400, "Token and new password are required");
    }

    await this.authService.setPassword(token, password);
    
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Password set successfully"));
  });
}
