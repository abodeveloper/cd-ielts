import api from "@/lib/axios";
import { ReadingFormValues } from "../schemas/reading-schema";

export const getReadingsData = async () => {
  const response = await api.get("/api/readings/");
  return response.data;
};

export const getReadingOne = async (id: string | number) => {
  const response = await api.get(`/api/readings/${id}/`);
  return response.data;
};

export const postReadingAnswers = async (data: ReadingFormValues) => {
  const response = await api.post("/api/readings/", data);
  return response.data;
};
