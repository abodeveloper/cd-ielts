import Image from "@/assets/ielts.webp";
import Logo from "@/assets/logo.jpg";
import { Role } from "@/shared/enums/role.enum";
import { useAuthStore } from "@/store/auth-store";
import { Navigate, useLocation } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
  const { isAuthenticated, user, loading } = useAuthStore();
  const location = useLocation();

  if (isAuthenticated && !loading) {
    return (
      <Navigate
        to={user?.role === Role.TEACHER ? "/teacher" : "/student"}
        state={{ from: location }}
        replace
      />
    );
  }

  // Login sahifasi UI
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* <div className="flex justify-center gap-2 md:justify-start">
          <div className="flex justify-center items-center">
            <img src={Logo} alt="" className="w-20" />
          </div>
        </div> */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-center mb-12 ">
              <img src={Logo} alt="" className="w-32" />
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={Image}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
