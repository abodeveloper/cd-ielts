// schemas/listening-schema.ts
import { z } from "zod";

export const listeningSchema = z.object({
  answers: z
    .array(
      z
        .object({
          listening_id: z.number().optional() || z.string().optional(),
          question_number: z.number().optional() || z.string().optional(),
          answer: z.string().nullable().optional(),
        })
        .nullable()
    )
    .optional(),
});

export type ListeningFormValues = z.infer<typeof listeningSchema>;

export type AnswerPayload = NonNullable<ListeningFormValues["answers"]>;
