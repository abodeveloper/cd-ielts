import api from "@/lib/axios";
import { LoginDto } from "@/shared/interfaces/auth";

export const getReadingData = async () => {
  const response = await api.get("/api/readings/");
  return response.data;
};

export const postReading = async (data: LoginDto) => {
  const response = await api.post("/api/readings/", data);
  return response.data;
};
