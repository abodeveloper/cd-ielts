import api from "@/lib/axios";

export const getMaterials = async () => {
  const response = await api.get("/api/test-materials/");
  return response.data;
};
