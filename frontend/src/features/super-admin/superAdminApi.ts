import { axiosInstance } from "../../lib/axios";

export const getDashboardDataApi = async () => {
  const response = await axiosInstance.get("/super-admin/dashboard");
  return response.data;
};

export const addGymApi = async (data: { name: string; ownerName: string; ownerEmail: string; password?: string }) => {
  const response = await axiosInstance.post("/super-admin/gyms", data);
  return response.data;
};

export const updateGymApi = async (data: { gymId: string; name?: string; plan?: string; status?: string }) => {
  const { gymId, ...rest } = data;
  const response = await axiosInstance.put(`/super-admin/gyms/${gymId}`, rest);
  return response.data;
};

export const suspendGymApi = async (gymId: string) => {
  const response = await axiosInstance.patch(`/super-admin/gyms/${gymId}/suspend`);
  return response.data;
};
