export type Role = "SUPER_ADMIN" | "GYM_OWNER" | "GYM_ADMIN" | "TRAINER" | "MEMBER";

export interface User {
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
