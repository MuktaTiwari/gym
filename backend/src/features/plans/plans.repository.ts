import { Plan, IPlan } from "../../models/plan.model";

export class PlansRepository {
  async getPlansByGymId(gymId: string, page?: number, limit?: number) {
    if (page && limit) {
      const skip = (page - 1) * limit;
      const totalDocs = await Plan.countDocuments({ gymId });
      const docs = await Plan.find({ gymId })
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

    const docs = await Plan.find({ gymId }).sort({ createdAt: -1 });
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

  async createPlan(planData: Partial<IPlan>) {
    return await Plan.create(planData);
  }

  async updatePlan(planId: string, gymId: string, planData: Partial<IPlan>) {
    return await Plan.findOneAndUpdate({ _id: planId, gymId }, planData, { new: true });
  }

  async deletePlan(planId: string, gymId: string) {
    return await Plan.findOneAndDelete({ _id: planId, gymId });
  }
}
