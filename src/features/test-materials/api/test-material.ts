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

export const getOneMockMaterial = async (
  id: string | number | undefined
) => {
  const response = await api.get(`/api/mock-material-info/${id}/`);
  return response.data;
};

export const getOneThematicMaterial = async (
  skill: string | undefined,
  id: string | number | undefined
) => {
  const response = await api.get(`/api/thematic-material-info/${skill}/${id}/`);
  return response.data;
};

export const getOneThematicMaterialSection = async (
  skill: string | undefined,
  id: string | number | undefined
) => {
  const response = await api.get(`/api/detail-material/${skill}/${id}/`);
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

export const getAllMockMaterialResults = async (
  material_id: string| undefined,
  group_id: string | undefined
) => {
  const url = `/api/all-results/full?material_id=${material_id}&group_id=${group_id}`;
  const response = await api.get(url);
  return response.data;
};

export const getAllThematicMaterialResults = async (
  type: string | undefined,
  material_id: string | undefined,
  group_id: string | undefined
) => {
  const url = `/api/all-results/thematic/${type}/?material_id=${material_id}&group_id=${group_id}`;
  const response = await api.get(url);
  return response.data;
};

export const getThematicMaterialGroups = async (
  skill: string,
  page: number,
  search: string,
  filterQuery: string,
  extraFilterQuery: string
) => {
  let url = `/api/thematic/statistics/${skill}/?page=${page}`;
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
