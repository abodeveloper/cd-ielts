import { ReadingQuestionType } from "@/shared/enums/reading-question-type.enum";

export interface Question {
  id: number;
  question_type: ReadingQuestionType;
  question: string;
}

export interface Reading {
  id: number;
  reading_section: number;
  content: string;
  photo: string | null;
  questions: Question[];
}

export interface ReadingsResponse {
  data: Reading[];
}
