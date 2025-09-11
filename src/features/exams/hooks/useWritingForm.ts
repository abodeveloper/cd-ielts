import { toastService } from "@/lib/toastService";
import { Role } from "@/shared/enums/role.enum";
import { useAuthStore } from "@/store/auth-store";
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
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const query = useWriting(id);

  const material = get(query.data, "material");

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

  const handleNextStep = () => {
    finish();
  };

  const writingMutation = useMutation({
    mutationFn: (data: AnswerPayload) => postWritingAnswers(id, data),
    onSuccess: () => {
      toastService.success("Successfully submitted!");
      handleNextStep();
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toastService.error(get(error, "response.data.error", ""));
    },
  });

  const form = useForm<WritingFormValues>({
    resolver: zodResolver(writingSchema),
    defaultValues: {
      answers: [],
    },
  });

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
