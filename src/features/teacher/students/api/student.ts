import api from "@/lib/axios";

export const getStudentsData = async (
  page: number,
  search: string,
  filterQuery: string,
  extraFilterQuery: string
) => {
  let url = `/api/teacher/students/?page=${page}`;
  if (search) {
    url += `&search=${search}`;
  }
  if (filterQuery) {
    url += `&${filterQuery}`;
  }
  if (extraFilterQuery) {
    url += `&${extraFilterQuery}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const getStudentOne = async (id: string | number| undefined) => {
  const response = await api.get(`/api/teacher/students/${id}/`);
  return response.data;
};
