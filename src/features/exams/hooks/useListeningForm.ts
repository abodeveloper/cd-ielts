import { toastService } from "@/lib/toastService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { get } from "lodash";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { postListeningAnswers } from "../api/listening";
import {
  AnswerPayload,
  ListeningFormValues,
  listeningSchema,
} from "../schemas/listening-schema";
import { useListening } from "./useListening";

export const useListeningForm = (
  id: string | undefined,
  onNext?: (data: unknown) => void
) => {
  const form = useForm<ListeningFormValues>({
    resolver: zodResolver(listeningSchema),
    defaultValues: { answers: [] },
  });

  const listeningMutation = useMutation({
    mutationFn: (data: AnswerPayload) => postListeningAnswers(id, data),
    onSuccess: (res) => {
      toastService.success("Successfully submitted!");
      onNext?.(res);
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toastService.error(get(error, "response.data.error", ""));
    },
  });

  const query = useListening(id);

  const { fields: answersFields, replace } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  useEffect(() => {
    const data = query.data;

    const allQuestions = Array.isArray(data?.listening_parts)
      ? data.listening_parts.flatMap((part) =>
          part?.question_numbers?.map((q) => ({
            listening_id: part.id, // 🔥 qaysi partdan kelganini bilish uchun
            question_number: q.question_number,
            answer: "", // userning javobi
          }))
        )
      : [];

    replace(allQuestions);
  }, [query.data, replace]);

  const onSubmit = (data: ListeningFormValues) => {
    const submitData: AnswerPayload = [...get(data, "answers", [])];
    listeningMutation.mutate(submitData);
  };

  return {
    form,
    listeningMutation,
    onSubmit,
    answersFields,
    query,
  };
};
