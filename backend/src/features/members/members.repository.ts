import { User, IUser } from "../../models/user.model";
import { Member, IMember } from "../../models/member.model";
import { Role } from "../../enums/roles.enum";

export class MembersRepository {
  async getMembersByGymId(gymId: string) {
    return await User.find({ gymId, role: Role.MEMBER })
      .select("-password -refreshToken")
      .populate({
        path: "memberProfile",
        populate: {
          path: "planId",
          select: "name price durationInMonths type",
        },
      })
      .sort({ createdAt: -1 });
  }

  async getMemberById(memberId: string, gymId: string) {
    return await User.findOne({ _id: memberId, gymId, role: Role.MEMBER })
      .select("-password -refreshToken")
      .populate({
        path: "memberProfile",
        populate: {
          path: "planId",
          select: "name price durationInMonths type",
        },
      });
  }

  async createMember(memberData: Partial<IUser>) {
    return await User.create({
      ...memberData,
      role: Role.MEMBER
    });
  }

  async createMemberProfile(profileData: Partial<IMember>) {
    return await Member.create(profileData);
  }
}
