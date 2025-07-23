// useLoginForm.ts
import { toastService } from "@/lib/toastService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { postReading } from "../api/reading";
import { ReadingFormValues, readingSchema } from "../schemas/reading-schema";

export const useReadingForm = () => {
  const form = useForm<ReadingFormValues>({
    resolver: zodResolver(readingSchema),
    defaultValues: {
    },
  });

  const redingMutation = useMutation({
    mutationFn: postReading,
    onSuccess: () => {
      toastService.success("Successfull submitted !");
    },
    onError: (error) => {
      console.error("Error:", error);
      toastService.error(error.message);
    },
  });

  const onSubmit = (data: ReadingFormValues) => {
    redingMutation.mutate(data);
  };

  return {
    form,
    redingMutation,
    onSubmit,
  };
};
