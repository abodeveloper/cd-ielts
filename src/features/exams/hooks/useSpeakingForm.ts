import { toastService } from "@/lib/toastService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { postSpeakingAnswers } from "../api/speaking";
import { SpeakingFormValues, speakingSchema } from "../schemas/speaking-schema";
import { useSpeaking } from "./useSpeaking";
import { get } from "lodash";

export const useSpeakingForm = (id: string | undefined) => {
  const navigate = useNavigate();

  const form = useForm<SpeakingFormValues>({
    resolver: zodResolver(speakingSchema),
    defaultValues: {
      record: undefined,
    },
  });

  const speakingMutation = useMutation({
    mutationFn: (formData: FormData) => postSpeakingAnswers(formData),
    onSuccess: () => {
      toastService.success("Successfully submitted!");
      navigate("/profile");
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toastService.error(get(error, "response.data.error", ""));
    },
  });

  const onSubmit = (formData: FormData) => {
    if (speakingMutation.isPending) {
      return;
    }
    speakingMutation.mutate(formData);
  };

  return {
    form,
    speakingMutation,
    onSubmit,
    query: useSpeaking(id),
  };
};
