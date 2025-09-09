// schemas/reading-schema.ts
import { z } from "zod";

export const readingSchema = z.object({
  answers: z
    .array(
      z
        .object({
          reading_id: z.union([z.number(), z.string()]).optional(),
          question_number: z.union([z.number(), z.string()]).optional(),
          answer: z.string().nullable().optional(), // string yoki null bo‘lishi mumkin
        })
        .nullable() // element o‘zi null bo‘lishi ham mumkin
    )
    .optional(),
});

export type ReadingFormValues = z.infer<typeof readingSchema>;

export type AnswerPayload = NonNullable<ReadingFormValues["answers"]>;
