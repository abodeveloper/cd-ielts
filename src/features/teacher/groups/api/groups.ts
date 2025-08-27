import api from "@/lib/axios";

export const getGroupsData = async (
  page: number,
  search: string,
  filterQuery: string
) => {
  let url = `/api/teacher/groups/?page=${page}`;
  if (search) {
    url += `&search=${search}`;
  }
  if (filterQuery) {
    url += `&${filterQuery}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const getGroupOne = async (id: string | number | undefined) => {
  const response = await api.get(`/api/teacher/groups/${id}/`);
  return response.data;
};

export const getAllGroups = async () => {
  const response = await api.get(`/api/teacher/all_groups/`);
  return response.data;
};
