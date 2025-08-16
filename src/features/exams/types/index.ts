import { ReadingQuestionType } from "@/shared/enums/reading-question-type.enum";

export interface TestData {
  id: string | number;
  content: string;
  questions?: string;
  passage_number: number;
  answers?: any[];
}

export interface Reading extends TestData {
  id: number;
  test_material: number;
  test_material_id: number;
  passage_number: number;
  created_at: string;
  content: string;
  questions: string;
  answers: Answer[];
}

export interface Listening extends TestData {
  id: number;
  test_material: number;
  test_material_id: number;
  passage_number: number;
  created_at: string;
  content: string;
  questions: string;
  answers: Answer[];
}

export interface Writing extends TestData {
  id: number;
  test_material: number;
  test_material_id: number;
  passage_number: number;
  created_at: string;
  content: string;
  questions: string;
  answers: Answer[];
}

export interface Answer {
  id: number;
  question_number: number;
  question_type: ReadingQuestionType;
  answer?: string;
  true_answer: unknown;
  user_id?: number;
  user_name: string;
}

