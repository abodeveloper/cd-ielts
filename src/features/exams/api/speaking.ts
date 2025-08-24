import api from "@/lib/axios";
import { AnswerPayload } from "../schemas/speaking-schema";

export const getSpeakingsData = async () => {
  const response = await api.get("/api/speakings/");
  return response.data;
};

export const getSpeakingOne = async (id: string | number) => {
  const response = await api.get(`/api/speaking/by-material/${id}/`);
  return response.data;
};

export const postSpeakingAnswers = async (
  data: AnswerPayload
) => {
  const response = await api.post(`/api/speaking-answers/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
