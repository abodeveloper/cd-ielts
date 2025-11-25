import { ListeningPart } from "@/features/exams/types";

export const sortListeningParts = (parts: ListeningPart[] = []) => {
  return [...parts].sort((a, b) => {
    const sectionDiff =
      (a.listening_section ?? 0) - (b.listening_section ?? 0);
    if (sectionDiff !== 0) {
      return sectionDiff;
    }

    return a.id - b.id;
  });
};


