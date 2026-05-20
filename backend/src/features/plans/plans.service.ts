import { PlansRepository } from "./plans.repository";
import { IPlan, Plan } from "../../models/plan.model";
import { Member } from "../../models/member.model";
import { Payment } from "../../models/payment.model";
import { MembershipStatus } from "../../enums/membershipStatus.enum";
import { ApiError } from "../../utils/ApiError";

export class PlansService {
  private plansRepository: PlansRepository;

  constructor() {
    this.plansRepository = new PlansRepository();
  }

  async getPlans(gymId: string, page?: number, limit?: number) {
    return await this.plansRepository.getPlansByGymId(gymId, page, limit);
  }

  async createPlan(planData: Partial<IPlan>, gymId: string) {
    return await this.plansRepository.createPlan({
      ...planData,
      gymId: gymId as any,
    });
  }

  async updatePlan(planId: string, gymId: string, planData: Partial<IPlan>) {
    return await this.plansRepository.updatePlan(planId, gymId, planData);
  }

  async deletePlan(planId: string, gymId: string) {
    return await this.plansRepository.deletePlan(planId, gymId);
  }

  async getPlanStats(planId: string, gymId: string) {
    const plan = await Plan.findOne({ _id: planId, gymId });
    if (!plan) {
      throw new ApiError(404, "Plan not found");
    }

    const activeMembers = await Member.countDocuments({
      planId,
      gymId,
      status: MembershipStatus.ACTIVE,
    });

    const payments = await Payment.find({
      planName: plan.name,
      gymId,
      status: "COMPLETED",
    });

    const totalRevenue = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

    return {
      activeMembers,
      totalRevenue,
    };
  }
}
