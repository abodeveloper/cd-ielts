import api from "@/lib/axios";
import { AnswerPayload } from "../schemas/reading-schema";

export const getReadingsData = async () => {
  const response = await api.get("/api/readings/");
  return response.data;
};

export const getReadingOne = async (id: string | number) => {
  const response = await api.get(`/api/reading/by-material/${id}/`);
  return response.data;
};

export const postReadingAnswers = async (
  id: string | undefined,
  data: AnswerPayload
) => {
  const response = await api.post(`/api/reading-answers/${id}/`, data);
  return response.data;
};
