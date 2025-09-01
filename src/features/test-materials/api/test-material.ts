import api from "@/lib/axios";

export const getTestsData = async (
  page: number,
  search: string,
  filterQuery: string,
  extraFilterQuery: string
) => {
  let url = `/api/tests/?page=${page}`;
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

export const getTestMaterialsData = async (
  page: number,
  search: string,
  filterQuery: string,
  extraFilterQuery: string
) => {
  let url = `/api/test-materials/?page=${page}`;
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

export const getOneTestMaterial = async (id: string | number | undefined) => {
  const response = await api.get(`/api/test-materials/${id}/`);
  return response.data;
};
