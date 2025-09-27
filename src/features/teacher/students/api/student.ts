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

export const getStudentOne = async (id: string | number | undefined) => {
  const response = await api.get(`/api/teacher/students/${id}/`);
  return response.data;
};

export const getStudentReadingMockResults = async (
  id: string | undefined,
  page: number,
  search: string,
  filterQuery?: string,
  extraFilterQuery?: string
) => {
  let url = `/api/student/detail/${id}/mock/reading?page=${page}`;
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

export const getStudentResults = async (
  id: string | undefined,
  test_type: string | undefined,
  skill: string | undefined,
  page: number,
  search: string,
  filterQuery?: string,
  extraFilterQuery?: string
) => {
  let url = `/api/student/detail/${id}/${test_type}/${skill}?page=${page}`;
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

export const getStudentResultOne = async (
  id: string | undefined,
  test_type: string | undefined,
  skill: string | undefined,
  obj_id: string | undefined
) => {
  const response = await api.get(
    `/api/student/info/${id}/${test_type}/${skill}/${obj_id}/`
  );
  return response.data;
};

export const getStudentMocks = async (
  id: string | undefined,
  page: number,
  search: string
) => {
  let url = `/api/student-mocks/${id}/?page=${page}`;
  if (search) {
    url += `&search=${search}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const getStudentMockResult = async (
  student_id: string | undefined,
  test_id: string | undefined
) => {
  const url = `/api/student-mocks/${student_id}/${test_id}/`;
  const response = await api.get(url);
  return response.data;
};

export const getStudentThematics = async (
  id: string | undefined,
  page: number,
  search: string
) => {
  let url = `/api/student-thematics/${id}/?page=${page}`;
  if (search) {
    url += `&search=${search}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const getStudentThematicResult = async (
  skill: string | undefined,
  student_id: string | undefined,
  material_id: string | undefined
) => {
  const url = `/api/student-thematics/${student_id}/${skill}/${material_id}/`;
  const response = await api.get(url);
  return response.data;
};
