import { axiosInstance } from "../../lib/axios";

export const loginApi = async (data: any) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

export const registerApi = async (data: any) => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data;
};

export const logoutApi = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getMeApi = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};
