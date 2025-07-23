// useLoginForm.ts
import { toastService } from "@/lib/toastService";
import { useAuthStore } from "@/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { login } from "../api/login";
import { LoginFormValues, loginSchema } from "../schemas/login-schema";

export const useLoginForm = () => {
  const navigate = useNavigate();

  const auth = useAuthStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin",
      password: "1",
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const token = data.token;
      if (token) {
        auth.login(token); // cookiega saqlanadi va storega
        navigate("/profile"); // muvaffaqiyatli kirgandan so'ng dashboardga yo'naltirish
      }
    },
    onError: (error) => {
      console.error("Error:", error);
      toastService.error(error.message);
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return {
    form,
    loginMutation,
    onSubmit,
  };
};
