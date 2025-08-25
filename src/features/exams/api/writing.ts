import api from "@/lib/axios";
import { AnswerPayload } from "../schemas/writing-schema";

export const getWritingsData = async () => {
  const response = await api.get("/api/writings/");
  return response.data;
};

export const getWritingOne = async (id: string | number) => {
  const response = await api.get(`/api/writing/by-material/${id}/`);
  return response.data;
};

export const postWritingAnswers = async (
  id: string | undefined,
  data: AnswerPayload
) => {
  const response = await api.post(`/api/writing-answers/${id}/`, data);
  return response.data;
};
