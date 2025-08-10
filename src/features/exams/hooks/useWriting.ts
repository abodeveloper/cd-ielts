// hooks/useReading.ts
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getWritingOne } from "../api/writing";
import { Writing } from "../types";

export const useWriting = (
  id: string | undefined
): UseQueryResult<Writing, Error> => {
  return useQuery<Writing, Error>({
    queryKey: ["writings", id],
    queryFn: () => getWritingOne(id as string), // id ni string sifatida tekshirish
    enabled: !!id, // id mavjud bo'lganda faqat chaqirilsin
  });
};
