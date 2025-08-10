// hooks/useReading.ts
import { getReadingOne } from "@/features/exams/api/reading";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Reading } from "../types";

export const useReading = (
  id: string | undefined
): UseQueryResult<Reading, Error> => {
  return useQuery<Reading, Error>({
    queryKey: ["readings", id],
    queryFn: () => getReadingOne(id as string), // id ni string sifatida tekshirish
    enabled: !!id, // id mavjud bo'lganda faqat chaqirilsin
  });
};
