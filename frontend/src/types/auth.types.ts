export type Role = "SUPER_ADMIN" | "GYM_OWNER" | "GYM_ADMIN" | "TRAINER" | "MEMBER";

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface MemberPlan {
  _id: string;
  name: string;
  price: number;
  durationInMonths: number;
}

export interface MemberProfile {
  _id: string;
  memberId?: string;
  membershipCardId?: string;
  fullName: string;
  email: string;
  phone?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  status?: string;
  planId?: MemberPlan;
  membershipStartDate?: string;
  membershipEndDate?: string;
  assignedTrainer?: string;
  assignedTrainerId?: string;
  emergencyContact?: EmergencyContact;
}

export interface User {
  memberProfile?: MemberProfile;
  _id: string;
  name: string;
  email: string;
  role: Role;
  gymId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logoutAction: () => void;
  setLoading: (isLoading: boolean) => void;
}
