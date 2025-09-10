export interface TestData {
  id: number;
  title: string;
  answer_time: number;
}

export interface Reading extends TestData {
  id: number;
  title: string;
  answer_time: number;
  is_view: boolean;
  material: {
    id: number;
    title: string;
    listening_id: string;
  };
  reading_parts: ReadingPart[];
}

export interface ReadingPart {
  id: number;
  title: string;
  passage_number: number;
  description: string;
  content: string;
  questions: string;
  created_at: string;
  question_numbers: {
    id: string;
    question_number: number;
  }[];
}

export interface Listening extends TestData {
  id: number;
  title: string;
  listening_parts: ListeningPart[];
}

export interface ListeningPart {
  id: number;
  title: string;
  listening_section: number;
  questions: string;
  audio: unknown;
  audioscript: string;
  description: string;
  created_at: string;
  is_script: boolean;
  question_numbers: {
    id: string;
    question_number: number;
  }[];
}

export interface Writing extends TestData {
  id: number;
  title: string;
  answer_time: number;
  writing_parts: WritingPart[];
}

export interface WritingPart {
  id: number;
  writing_task: number;
  description: string;
  created_at: string;
  writing_questions: {
    id: number;
    question_number: number;
    question: string;
  }[];
}

export type AllTestParts = ReadingPart | ListeningPart | WritingPart;

export interface Speaking {
  id: number;
  title: string;
  test_material: number;
  speaking_parts: SpeakingPart[];
}

export interface SpeakingPart {
  id: number;
  speaking_part: number;
  prep_time: number;
  answer_time: number;
  comment: string;
  description: string;
  question_numbers: {
    id: number;
    question_number: number;
    question: string;
  }[];
}
