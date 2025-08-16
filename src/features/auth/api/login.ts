import api from "@/lib/axios";
import { LoginDto } from "@/shared/interfaces/auth";

export const login = async (data: LoginDto) => {
  const response = await api.post("/api/login/", data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/api/me/");
  return response.data;
};
