import api from "@/lib/axios";

export const getDashbordStatistics = async (
) => {
  const url = `/api/dashboard-statistics/`;
  const response = await api.get(url);
  return response.data;
};
