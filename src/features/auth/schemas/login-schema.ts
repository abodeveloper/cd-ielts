import { z } from "zod";

export const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(1, "Parol kamida 1 belgidan iborat bo‘lishi kerak"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
