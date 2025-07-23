import { useAuthStore } from "@/store/auth-store"; // zustanddan
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useAuthStore((state) => state.isAuthenticated);

  return isAuth ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
