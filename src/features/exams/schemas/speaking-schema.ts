// schemas/reading-schema.ts
import { z } from "zod";

export const speakingSchema = z.object({
  record: z.instanceof(File).refine((file) => file.type.startsWith("audio/"), {
    message: "Faqat audio fayllar qabul qilinadi",
  }),
});

export type SpeakingFormValues = z.infer<typeof speakingSchema>;

export type AnswerPayload = FormData;
