// useLoginForm.ts
import { toastService } from "@/lib/toastService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { get, isArray } from "lodash";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { postReadingAnswers } from "../api/reading";
import { ReadingFormValues, readingSchema } from "../schemas/reading-schema";
import { useReading } from "./useReading";

export const useReadingForm = (id: string | undefined) => {
  const form = useForm<ReadingFormValues>({
    resolver: zodResolver(readingSchema),
    defaultValues: {},
  });

  const readingMutation = useMutation({
    mutationFn: postReadingAnswers,
    onSuccess: () => {
      toastService.success("Successfull submitted !");
    },
    onError: (error) => {
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
          .flatMap((item) => item.questions)
          .map((item) => {
            return {
              reading_question: item.id,
              answer: "",
            };
          })
      : [];

    if (allQuestions) {
      replace(allQuestions);
    }
  }, [query.data, form, replace, query.isRefetching]);

  const onSubmit = (data: ReadingFormValues) => {
    const submitData = [...get(data, "answers", [])];

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
