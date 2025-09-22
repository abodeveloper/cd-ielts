import api from "@/lib/axios";

export const getMyMocks = async (
  page: number,
  search: string
) => {
  let url = `/api/me/mocks/?page=${page}`;
  if (search) {
    url += `&search=${search}`;
  }
  const response = await api.get(url);
  return response.data;
};
