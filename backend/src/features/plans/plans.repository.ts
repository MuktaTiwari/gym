import { Plan, IPlan } from "../../models/plan.model";

export class PlansRepository {
  async getPlansByGymId(gymId: string) {
    return await Plan.find({ gymId }).sort({ createdAt: -1 });
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
