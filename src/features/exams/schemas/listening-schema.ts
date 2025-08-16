// schemas/reading-schema.ts
import { z } from "zod";

export const listeningSchema = z.object({
  answers: z
    .array(
      z.object({
        question_number: z.number(),
        answer: z.string(),
      })
    )
    .optional(),
});

export type ListeningFormValues = z.infer<typeof listeningSchema>;

export type AnswerPayload = NonNullable<ListeningFormValues["answers"]>;
