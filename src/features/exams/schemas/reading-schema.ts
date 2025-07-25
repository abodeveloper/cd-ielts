// schemas/reading-schema.ts
import { z } from "zod";

export const readingSchema = z.object({
  answers: z
    .array(
      z.object({
        reading_question: z
          .number()
          .min(1, "Question ID is required")
          .optional(),
        answer: z.string().optional(),
      })
    )
    .optional(),
});

export type ReadingFormValues = z.infer<typeof readingSchema>;
