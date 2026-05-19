import { useAuthStore } from "../store/authStore";
import { Role } from "../types/auth.types";

export const usePermission = () => {
  const { user, isAuthenticated } = useAuthStore();

  const hasRole = (allowedRoles: Role[]) => {
    if (!isAuthenticated || !user) return false;
    return allowedRoles.includes(user.role);
  };

  const isSuperAdmin = isAuthenticated && user?.role === "SUPER_ADMIN";
  const isGymOwner = isAuthenticated && user?.role === "GYM_OWNER";
  const isGymAdmin = isAuthenticated && user?.role === "GYM_ADMIN";
  const isTrainer = isAuthenticated && user?.role === "TRAINER";
  const isMember = isAuthenticated && user?.role === "MEMBER";

  return {
    hasRole,
    isSuperAdmin,
    isGymOwner,
    isGymAdmin,
    isTrainer,
    isMember,
    user,
    isAuthenticated,
  };
};
