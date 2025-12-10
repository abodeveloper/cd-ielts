import { toastService } from "@/lib/toastService";
import { useAuthStore } from "@/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { login } from "../api/login";
import { LoginFormValues, loginSchema } from "../schemas/login-schema";
import { useEffect } from "react";
import { Role } from "@/shared/enums/role.enum";

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { login: LoginToken, fetchMe, user, loading } = useAuthStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      const token = data.token;
      if (token) {
        LoginToken(token); // Tokenni cookie va storega saqlash
        await fetchMe(); // Foydalanuvchi ma'lumotlarini olish
      }
    },
    onError: (error) => {
      console.error("Error:", error);
      toastService.error(error.message);
    },
  });

  // user va loading holatiga qarab yo‘naltirish
  useEffect(() => {
    if (loginMutation.isSuccess && !loading && user) {
      if (user.role === Role.TEACHER) {
        navigate("/teacher");
      } else if (user.role === Role.STUDENT) {
        navigate("/student");
      } else {
        navigate("/login");
        alert(1);
        toastService.error("Foydalanuvchi roli aniqlanmadi");
      }
    }
  }, [loginMutation.isSuccess, loading, user, navigate]);

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return {
    form,
    loginMutation,
    onSubmit,
  };
};
