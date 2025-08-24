// hooks/useReading.ts
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getSpeakingOne } from "../api/speaking";
import { Speaking } from "../types";

export const useSpeaking = (
  id: string | undefined
): UseQueryResult<Speaking, Error> => {
  return useQuery<Speaking, Error>({
    queryKey: ["speakings", id],
    queryFn: () => getSpeakingOne(id as string), // id ni string sifatida tekshirish
    enabled: !!id, // id mavjud bo'lganda faqat chaqirilsin
  });
};
