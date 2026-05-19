import { MembersRepository } from "./members.repository";
import { ApiError } from "../../utils/ApiError";
import bcrypt from "bcrypt";
import { User, IUser } from "../../models/user.model";

export class MembersService {
  private membersRepository: MembersRepository;

  constructor() {
    this.membersRepository = new MembersRepository();
  }

  async getMembers(gymId: string) {
    return await this.membersRepository.getMembersByGymId(gymId);
  }

  async getMember(memberId: string, gymId: string) {
    return await this.membersRepository.getMemberById(memberId, gymId);
  }

  async createMember(memberData: any, gymId: string) {
    // Check if member with email already exists in the system
    const existingUser = await User.findOne({ email: memberData.email });
    if (existingUser) {
      throw new ApiError(400, "A user with this email already exists");
    }

    // Extract profile fields if present
    const {
      status,
      planId,
      joinDate,
      endDate,
      weight,
      height,
      age,
      gender,
      emergencyContact,
      password,
      name,
      email,
    } = memberData;

    // Hash password if provided, else generate a random one
    const passwordToHash = password || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    const newUser = await this.membersRepository.createMember({
      name,
      email,
      password: hashedPassword,
      gymId: gymId as any,
    });

    // Create member profile linked to the newUser
    await this.membersRepository.createMemberProfile({
      userId: newUser._id as any,
      gymId: gymId as any,
      status,
      planId: planId || undefined,
      joinDate: joinDate || new Date(),
      endDate,
      weight,
      height,
      age,
      gender,
      emergencyContact,
    });

    // Fetch complete user with virtual memberProfile populated
    const completedMember = await this.membersRepository.getMemberById(newUser._id as string, gymId);
    if (!completedMember) {
      throw new ApiError(500, "Failed to create complete member profile");
    }
    
    return completedMember;
  }
}
