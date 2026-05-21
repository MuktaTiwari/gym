import { axiosInstance } from "../../lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GymProfile {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  logo?: string;
}

export interface GymSettings {
  theme?: "light" | "dark" | "system";
  primaryColor?: string;
  fontStyle?: "default" | "modern" | "classic";
}

export interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const gymApi = {
  // Profile
  getProfile: async (): Promise<GymProfile> => {
    const res = await axiosInstance.get("/gym/profile");
    return res.data.data;
  },

  updateProfile: async (data: Partial<Omit<GymProfile, "_id" | "logo">>): Promise<GymProfile> => {
    const res = await axiosInstance.patch("/gym/profile", data);
    return res.data.data;
  },

  uploadLogo: async (file: File): Promise<GymProfile> => {
    const formData = new FormData();
    formData.append("logo", file);
    const res = await axiosInstance.patch("/gym/profile/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  // Settings
  getSettings: async (): Promise<GymSettings> => {
    const res = await axiosInstance.get("/gym/settings");
    return res.data.data;
  },

  updateSettings: async (data: Partial<GymSettings>): Promise<GymSettings> => {
    const res = await axiosInstance.patch("/gym/settings", data);
    return res.data.data;
  },

  // Staff
  getStaff: async (): Promise<StaffMember[]> => {
    const res = await axiosInstance.get("/gym/staff");
    return res.data.data;
  },

  inviteStaff: async (data: { email: string; role: string }): Promise<{ user: StaffMember; tempPassword?: string }> => {
    const res = await axiosInstance.post("/gym/staff/invite", data);
    return res.data.data;
  },

  removeStaff: async (staffId: string): Promise<void> => {
    await axiosInstance.delete(`/gym/staff/${staffId}`);
  },

  changeStaffRole: async (staffId: string, role: string): Promise<StaffMember> => {
    const res = await axiosInstance.patch(`/gym/staff/${staffId}/role`, { role });
    return res.data.data;
  },

  // Danger Zone
  deactivateWorkspace: async (): Promise<void> => {
    await axiosInstance.delete("/gym/workspace");
  },

  resetAllPasswords: async (): Promise<{ resetCount: number; message: string }> => {
    const res = await axiosInstance.post("/gym/reset-all-passwords");
    return res.data.data;
  },

  exportData: async (): Promise<Blob> => {
    const res = await axiosInstance.get("/gym/export", { responseType: "blob" });
    return res.data;
  },
};
