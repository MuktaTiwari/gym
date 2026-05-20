import { ApiError } from "../../utils/ApiError";
import { Role } from "../../enums/roles.enum";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateTokens";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AuthRepository } from "./auth.repository";
import { Member } from "../../models/member.model";

export class AuthService {
  private readonly authRepository: AuthRepository;

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
    if (data.role !== Role.GYM_OWNER) {
      throw new ApiError(400, "Only Gym Owners can register an account. Members must be added by their gym administrator.");
    }

    if (!data.gymName || data.gymName.trim() === "") {
      throw new ApiError(400, "Gym or facility name is required");
    }

    const existingUser = await this.authRepository.findUserByEmail(data.email.toLowerCase());
    if (existingUser) {
      throw new ApiError(400, "User with this email already exists");
    }

    // Also verify no member exists with this email to avoid duplicate credentials
    const existingMember = await Member.findOne({ email: data.email.toLowerCase() });
    if (existingMember) {
      throw new ApiError(400, "A member with this email already exists");
    }

    let gymId;
    const gym = await this.authRepository.createGym(data.gymName);
    gymId = String(gym._id);

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

    // Try finding in User collection first
    const user = await this.authRepository.findUserByEmail(email.toLowerCase());
    let isMember = false;
    let member: any = null;

    if (!user) {
      // Try finding in Member collection
      member = await Member.findOne({ email: email.toLowerCase() }).populate("planId");
      if (!member) {
        throw new ApiError(404, "User or Member does not exist with this email");
      }
      isMember = true;
    }

    // Validate password
    if (isMember) {
      const isPasswordValid = await member.comparePassword(password);
      if (!isPasswordValid) {
        throw new ApiError(401, "Invalid member credentials");
      }
    } else {
      const isPasswordValid = await user!.comparePassword(password);
      if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
      }
    }

    const idStr = isMember ? String(member._id) : String(user!._id);
    const roleStr = isMember ? "MEMBER" : user!.role;
    const gymIdStr = isMember ? String(member.gymId) : (user!.gymId ? String(user!.gymId) : undefined);

    const accessToken = generateAccessToken(idStr, roleStr, gymIdStr);
    const refreshToken = generateRefreshToken(idStr);

    if (isMember) {
      member.refreshToken = refreshToken;
      await member.save();
    } else {
      await this.authRepository.updateUserRefreshToken(idStr, refreshToken);
    }

    const userResponse = isMember
      ? {
          _id: member._id,
          name: member.fullName,
          email: member.email,
          role: "MEMBER",
          gymId: member.gymId,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
          memberProfile: member,
        }
      : await this.authRepository.findUserByIdWithoutSecrets(idStr);

    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    try {
      const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET!) as any as { _id: string };
      
      let user = await this.authRepository.findUserById(decoded._id);
      let isMember = false;
      let member: any = null;

      if (!user) {
        member = await Member.findById(decoded._id);
        if (!member || member.refreshToken !== token) {
          throw new ApiError(401, "Invalid or expired refresh token");
        }
        isMember = true;
      } else {
        if (user.refreshToken !== token) {
          throw new ApiError(401, "Invalid or expired refresh token");
        }
      }

      const idStr = isMember ? String(member._id) : String(user!._id);
      const roleStr = isMember ? "MEMBER" : user!.role;
      const gymIdStr = isMember ? String(member.gymId) : (user!.gymId ? String(user!.gymId) : undefined);

      const accessToken = generateAccessToken(idStr, roleStr, gymIdStr);
      const newRefreshToken = generateRefreshToken(idStr);

      if (isMember) {
        member.refreshToken = newRefreshToken;
        await member.save();
      } else {
        await this.authRepository.updateUserRefreshToken(idStr, newRefreshToken);
      }

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new ApiError(401, "Invalid refresh token");
    }
  }

  async getUserProfile(userId: string) {
    const user = await this.authRepository.findUserByIdWithoutSecrets(userId);
    if (user) {
      return user;
    }

    // Try Member
    const member = await Member.findById(userId).populate("planId");
    if (member) {
      return {
        _id: member._id,
        name: member.fullName,
        email: member.email,
        role: "MEMBER",
        gymId: member.gymId,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        memberProfile: member,
      };
    }

    throw new ApiError(404, "User or Member not found");
  }

  async logout(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (user) {
      await this.authRepository.clearUserRefreshToken(userId);
    } else {
      await Member.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: 1 } },
        { new: true }
      );
    }
  }
}
