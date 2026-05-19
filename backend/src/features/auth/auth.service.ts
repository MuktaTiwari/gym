import { ApiError } from "../../utils/ApiError";
import { Role } from "../../enums/roles.enum";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateTokens";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AuthRepository } from "./auth.repository";

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async register(data: {
    name: string;
    email: string;
    password?: string;
    role: Role;
    gymName?: string;
  }) {
    const existingUser = await this.authRepository.findUserByEmail(data.email.toLowerCase());
    if (existingUser) {
      throw new ApiError(400, "User with this email already exists");
    }

    let gymId;
    if (data.role === Role.GYM_OWNER && data.gymName) {
      const gym = await this.authRepository.createGym(data.gymName);
      gymId = String(gym._id);
    }

    const user = await this.authRepository.createUser({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role,
      gymId,
    });

    const userResponse = await this.authRepository.findUserByIdWithoutSecrets(String(user._id));
    return userResponse;
  }

  async login(email: string, password?: string) {
    if (!password) {
      throw new ApiError(400, "Password is required");
    }

    const user = await this.authRepository.findUserByEmail(email.toLowerCase());
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }

    const accessToken = generateAccessToken(
      String(user._id),
      user.role,
      user.gymId ? String(user.gymId) : undefined
    );
    const refreshToken = generateRefreshToken(String(user._id));

    await this.authRepository.updateUserRefreshToken(String(user._id), refreshToken);

    const loggedInUser = await this.authRepository.findUserByIdWithoutSecrets(String(user._id));

    return {
      user: loggedInUser,
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    try {
      const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { _id: string };
      const user = await this.authRepository.findUserById(decoded._id);
      
      if (!user || user.refreshToken !== token) {
        throw new ApiError(401, "Invalid or expired refresh token");
      }

      const accessToken = generateAccessToken(
        String(user._id),
        user.role,
        user.gymId ? String(user.gymId) : undefined
      );
      const newRefreshToken = generateRefreshToken(String(user._id));

      await this.authRepository.updateUserRefreshToken(String(user._id), newRefreshToken);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new ApiError(401, "Invalid refresh token");
    }
  }

  async getUserProfile(userId: string) {
    return await this.authRepository.findUserByIdWithoutSecrets(userId);
  }

  async logout(userId: string) {
    await this.authRepository.clearUserRefreshToken(userId);
  }
}
