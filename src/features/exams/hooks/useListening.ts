// hooks/useReading.ts
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getListeningOne } from "../api/listening";
import { Listening } from "../types";

export const useListening = (
  id: string | undefined
): UseQueryResult<Listening, Error> => {
  return useQuery<Listening, Error>({
    queryKey: ["listenings", id],
    queryFn: () => getListeningOne(id as string), // id ni string sifatida tekshirish
    enabled: !!id, // id mavjud bo'lganda faqat chaqirilsin
  });
};
