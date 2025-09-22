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

export const getOneMockMaterial = async (id: string | number | undefined) => {
  const response = await api.get(`/api/material-info/${id}/`);
  return response.data;
};

export const getOneThematicMaterial = async (
  id: string | number | undefined
) => {
  const response = await api.get(`/api/thematic-material-info/${id}/`);
  return response.data;
};

export const getOneThematicMaterialSection = async (
  id: string | number | undefined
) => {
  const response = await api.get(`/api/detail-material/${id}/`);
  return response.data;
};

// export const getMockMaterialGroups = async (material_id: string | number | undefined) => {
//   const response = await api.get(`/api/statistics/${material_id}/`);
//   return response.data;
// };

export const getMockMaterialGroups = async (
  page: number,
  search: string,
  filterQuery: string,
  extraFilterQuery: string
) => {
  let url = `/api/mock/statistics/?page=${page}`;
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

export const getMockMaterialResults = async (
  type: string,
  page: number,
  search: string,
  filterQuery: string,
  extraFilterQuery: string
) => {
  let url = `/api/results/${type}/?page=${page}`;
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

export const getThematicMaterialGroups = async (
  page: number,
  search: string,
  filterQuery: string,
  extraFilterQuery: string
) => {
  let url = `/api/thematic/statistics/?page=${page}`;
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

export const getThematicMaterialResults = async (
  type: string,
  page: number,
  search: string,
  filterQuery: string,
  extraFilterQuery: string
) => {
  let url = `/api/results/thematic/${type}/?page=${page}`;
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
