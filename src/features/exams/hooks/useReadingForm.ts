import { toastService } from "@/lib/toastService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { get } from "lodash";
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

export const useReadingForm = (
  id: string | undefined,
  onNext?: (data: unknown) => void
) => {
  const navigate = useNavigate();
  const query = useReading(id);

  const is_view = get(query.data, "is_view");
  const material = get(query.data, "material");

  const form = useForm<ReadingFormValues>({
    resolver: zodResolver(readingSchema),
    defaultValues: { answers: [] },
  });

  const readingMutation = useMutation({
    mutationFn: (data: AnswerPayload) => postReadingAnswers(id, data),
    onSuccess: (res) => {
      toastService.success("Successfully submitted!");
      if (is_view === true) {
        onNext?.({ ...res, material }); // To'g'ri ma'lumot uzatish
      } else {
        if (get(material, "test_type") === "Mock") {
          navigate(`/writings/${get(material, "writing_id")}`);
        } else {
          navigate("/");
        }
      }
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toastService.error(get(error, "response.data.error", ""));
    },
  });

  const { fields: answersFields, replace } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  // useEffect(() => {
  //   const data = query.data;

  //   const allQuestions = Array.isArray(data?.reading_parts)
  //     ? data.reading_parts.flatMap((part) =>
  //         part?.question_numbers?.map((q) => ({
  //           reading_id: part.id, // 🔥 qaysi partdan kelganini bilish uchun
  //           question_number: q.question_number,
  //           answer: "", // userning javobi
  //         }))
  //       )
  //     : [];

  //   replace(allQuestions);
  // }, [query.data, replace]);

  useEffect(() => {
    const data = query.data;

    if (
      !Array.isArray(data?.reading_parts) ||
      data.reading_parts.length === 0
    ) {
      return;
    }

    // avval maksimal question_number topamiz
    const maxQuestionNumber = Math.max(
      ...data.reading_parts.flatMap((part) =>
        part?.question_numbers?.map((q) => q.question_number)
      )
    );

    // bo‘sh massiv tayyorlab olamiz
    const allQuestions: {
      reading_id: number;
      question_number: number;
      answer: string;
    }[] = Array(maxQuestionNumber).fill(null);

    // endi har bir question_number ni o‘z joyiga qo‘yamiz
    data.reading_parts.forEach((part) => {
      part?.question_numbers?.forEach((q) => {
        const index = q.question_number - 1; // 1-based bo‘lsa
        allQuestions[index] = {
          reading_id: part.id,
          question_number: q.question_number,
          answer: "",
        };
      });
    });

    replace(allQuestions);
  }, [query.data, replace]);

  const onSubmit = (data: ReadingFormValues) => {
    // null yoki undefined elementlarni olib tashlaymiz
    const submitData: AnswerPayload = (data.answers ?? []).filter(
      (a): a is NonNullable<typeof a> => a !== null && a !== undefined
    );

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
