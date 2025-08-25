import api from "@/lib/axios";
import { AnswerPayload } from "../schemas/listening-schema";

export const getListeningsData = async () => {
  const response = await api.get("/api/listenings/");
  return response.data;
};

export const getListeningOne = async (id: string | number) => {
  const response = await api.get(`/api/listening/by-material/${id}/`);
  return response.data;
};

export const postListeningAnswers = async (
  id: string | undefined,
  data: AnswerPayload
) => {
  const response = await api.post(`/api/listening-answers/${id}/`, data);
  return response.data;
};
