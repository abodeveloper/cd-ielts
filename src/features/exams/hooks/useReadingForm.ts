import { toastService } from "@/lib/toastService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { get, isArray } from "lodash";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { postReadingAnswers } from "../api/reading";
import {
  AnswerPayload,
  ReadingFormValues,
  readingSchema,
} from "../schemas/reading-schema";
import { useReading } from "./useReading";

export const useReadingForm = (id: string | undefined) => {
  const navigate = useNavigate();

  const form = useForm<ReadingFormValues>({
    resolver: zodResolver(readingSchema),
    defaultValues: { answers: [] },
  });

  const readingMutation = useMutation({
    mutationFn: (data: AnswerPayload) => postReadingAnswers(id, data),
    onSuccess: () => {
      toastService.success("Successfully submitted!");
      navigate("/profile");
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toastService.error(error.message);
    },
  });

  const query = useReading(id);

  const { fields: answersFields, replace } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  useEffect(() => {
    const item = query.data;

    const allQuestions = isArray(item)
      ? item
          .flatMap((item) => item.answers)
          .map((item) => ({
            question_number: item.question_number,
            answer: "",
          }))
      : [];

    replace(allQuestions);
  }, [query.data, replace, query.isRefetching]);

  const onSubmit = (data: ReadingFormValues) => {
    const submitData: AnswerPayload = [...get(data, "answers", [])];
    readingMutation.mutate(submitData);
  };

  return {
    form,
    readingMutation,
    onSubmit,
    answersFields,
    query,
  };
};
