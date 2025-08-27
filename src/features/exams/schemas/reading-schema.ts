// schemas/reading-schema.ts
import { z } from "zod";

export const readingSchema = z.object({
  answers: z
    .array(
      z.object({
        reading_id: z.number().optional() || z.string().optional(),
        question_number: z.number().optional() || z.string().optional(),
        answer: z.string().optional(),
      })
    )
    .optional(),
});

export type ReadingFormValues = z.infer<typeof readingSchema>;

export type AnswerPayload = NonNullable<ReadingFormValues["answers"]>;
