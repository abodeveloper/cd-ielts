import { toastService } from "@/lib/toastService";
import { Role } from "@/shared/enums/role.enum";
import { useAuthStore } from "@/store/auth-store";
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
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const query = useReading(id);

  const is_view = get(query.data, "is_view");
  const material = get(query.data, "material");
  const test_type = get(query.data, "test_type");

  const finish = () => {
    if (user?.role === Role.TEACHER) {
      navigate("/");
    } else {
      if (String(get(material, "test_type"))?.toLowerCase() == "mock") {
        const next_test = get(material, "next_test");
        const next_test_id = get(material, "next_test_id");

        if (next_test === "listening" && next_test_id) {
          navigate(`/listenings/${next_test_id}`);
        } else if (next_test === "speaking" && next_test_id) {
          navigate(`/speakings/${next_test_id}`);
        } else if (next_test === "writing" && next_test_id) {
          navigate(`/writings/${next_test_id}`);
        } else {
          navigate("/");
        }
      } else {
        navigate("/");
      }
    }
  };

  const handleNextStep = (res: object) => {
    if (test_type === "Thematic") {
      onNext?.({ ...res, material, finish });
    } else {
      if (user?.role === Role.TEACHER) {
        onNext?.({ ...res, material, finish });
      } else {
        if (is_view === true) {
          onNext?.({ ...res, material }); // To'g'ri ma'lumot uzatish
        } else {
          finish();
        }
      }
    }
  };

  const readingMutation = useMutation({
    mutationFn: (data: AnswerPayload) => postReadingAnswers(id, data),
    onSuccess: (res) => {
      toastService.success("Successfully submitted!");
      handleNextStep(res);
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toastService.error(get(error, "response.data.error", ""));
    },
  });

  const form = useForm<ReadingFormValues>({
    resolver: zodResolver(readingSchema),
    defaultValues: { answers: [] },
  });

  const { fields: answersFields, replace } = useFieldArray({
    control: form.control,
    name: "answers",
  });

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
    }[] = Array(maxQuestionNumber)?.fill(null);

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
