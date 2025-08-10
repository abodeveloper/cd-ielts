// schemas/reading-schema.ts
import { z } from "zod";

export const writingSchema = z.object({
  answers: z
    .array(
      z.object({
        writing_id: z.number(),
        writing_task: z.number(),
        answer: z.string(),
      })
    )
    .optional(),
});

export type WritingFormValues = z.infer<typeof writingSchema>;

export type AnswerPayload = NonNullable<WritingFormValues["answers"]>;
