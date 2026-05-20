import { Member, IMember } from "../../models/member.model";

export class MembersRepository {
  async getMembersByGymId(gymId: string, page?: number, limit?: number) {
    if (page && limit) {
      const skip = (page - 1) * limit;
      const totalDocs = await Member.countDocuments({ gymId });
      const docs = await Member.find({ gymId })
        .select("-password -refreshToken")
        .populate("planId")
        .populate("assignedTrainerId")
        .populate("paymentHistory")
        .populate("bookingHistory")
        .populate("attendanceRecords")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        docs,
        pagination: {
          total: totalDocs,
          page,
          limit,
          totalPages: Math.ceil(totalDocs / limit)
        }
      };
    }

    // Default return all if no pagination
    const docs = await Member.find({ gymId })
      .select("-password -refreshToken")
      .populate("planId")
      .populate("assignedTrainerId")
      .populate("paymentHistory")
      .populate("bookingHistory")
      .populate("attendanceRecords")
      .sort({ createdAt: -1 });

    return {
      docs,
      pagination: {
        total: docs.length,
        page: 1,
        limit: docs.length,
        totalPages: 1
      }
    };
  }

  async getMemberById(memberId: string, gymId: string) {
    // Query directly from Member collection
    return await Member.findOne({ _id: memberId, gymId })
      .select("-password -refreshToken")
      .populate("planId")
      .populate("assignedTrainerId")
      .populate("paymentHistory")
      .populate("bookingHistory")
      .populate("attendanceRecords");
  }

  async createMember(memberData: Partial<IMember>) {
    // Save only in the Member table
    return await Member.create(memberData);
  }
}
