// schemas/writing-schema.ts
import { z } from "zod";

export const writingSchema = z.object({
  answers: z
    .array(
      z
        .object({
          writing: z.number().optional(),
          question_number: z.number().optional(),
          answer: z.string().nullable().optional(),
        })
        .nullable()
    )
    .optional(),
});

export type WritingFormValues = z.infer<typeof writingSchema>;

export type AnswerPayload = NonNullable<WritingFormValues["answers"]>;
