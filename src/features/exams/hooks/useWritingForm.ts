import { toastService } from "@/lib/toastService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { get } from "lodash";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { postWritingAnswers } from "../api/writing";
import {
  AnswerPayload,
  WritingFormValues,
  writingSchema,
} from "../schemas/writing-schema";
import { useWriting } from "./useWriting";

export const useWritingForm = (id: string | undefined) => {
  const navigate = useNavigate();

  const form = useForm<WritingFormValues>({
    resolver: zodResolver(writingSchema),
    defaultValues: {
      answers: [],
    },
  });

  const writingMutation = useMutation({
    mutationFn: (data: AnswerPayload) => postWritingAnswers(id, data),
    onSuccess: () => {
      toastService.success("Successfully submitted!");
      navigate("/profile");
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toastService.error(get(error, "response.data.error", ""));
    },
  });

  const query = useWriting(id);

  const { fields: answersFields, replace } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  useEffect(() => {
    const data = query.data;

    const allQuestions = Array.isArray(data?.writing_parts)
      ? data.writing_parts.flatMap((part) =>
          part?.writing_questions?.map((q) => ({
            writing: part.id, // 🔥 qaysi partdan kelganini bilish uchun
            question_number: q.question_number,
            answer: "", // userning javobi
          }))
        )
      : [];

    replace(allQuestions);
  }, [query.data, replace]);

  const onSubmit = (data: WritingFormValues) => {
    const submitData: AnswerPayload = [...get(data, "answers", [])];
    writingMutation.mutate(submitData);
  };

  return {
    form,
    writingMutation,
    onSubmit,
    answersFields,
    query,
  };
};
