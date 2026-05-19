import { PlansRepository } from "./plans.repository";
import { IPlan } from "../../models/plan.model";

export class PlansService {
  private plansRepository: PlansRepository;

  constructor() {
    this.plansRepository = new PlansRepository();
  }

  async getPlans(gymId: string) {
    return await this.plansRepository.getPlansByGymId(gymId);
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
}
