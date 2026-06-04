import { User } from "../../models/user.model";
import { Gym } from "../../models/gym.model";
import { Role } from "../../enums/roles.enum";

export class AuthRepository {
  async findUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  async findUserById(userId: string) {
    return await User.findById(userId);
  }

  async findUserByIdWithoutSecrets(userId: string) {
    return await User.findById(userId).select("-password -refreshToken");
  }

  async createGym(gymName: string, ownerId: string) {
    return await Gym.create({ name: gymName, ownerId });
  }

  async createUser(data: {
    name: string;
    email: string;
    password?: string;
    role: Role;
    gymId?: string;
  }) {
    return await User.create(data);
  }

  async updateUserRefreshToken(userId: string, refreshToken: string) {
    await User.findByIdAndUpdate(userId, { refreshToken });
  }

  async clearUserRefreshToken(userId: string) {
    await User.findByIdAndUpdate(
      userId,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );
  }
}
