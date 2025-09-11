import { toastService } from "@/lib/toastService";
import { Role } from "@/shared/enums/role.enum";
import { useAuthStore } from "@/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { get } from "lodash";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { postSpeakingAnswers } from "../api/speaking";
import { SpeakingFormValues, speakingSchema } from "../schemas/speaking-schema";
import { useSpeaking } from "./useSpeaking";

export const useSpeakingForm = (id: string | undefined) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const query = useSpeaking(id);

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

  const speakingMutation = useMutation({
    mutationFn: (formData: FormData) => postSpeakingAnswers(formData),
    onSuccess: () => {
      toastService.success("Successfully submitted!");
      handleNextStep();
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toastService.error(get(error, "response.data.error", ""));
    },
  });

  const form = useForm<SpeakingFormValues>({
    resolver: zodResolver(speakingSchema),
    defaultValues: {
      record: undefined,
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
