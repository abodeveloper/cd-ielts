// schemas/reading-schema.ts
import { z } from "zod";

export const readingSchema = z.object({
  answers: z
    .array(
      z.object({
        question_number: z.number(),
        answer: z.string(),
      })
    )
    .optional(),
});

export type ReadingFormValues = z.infer<typeof readingSchema>;

export type AnswerPayload = NonNullable<ReadingFormValues["answers"]>;
