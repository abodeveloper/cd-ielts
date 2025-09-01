import { useAuthStore } from "@/store/auth-store";
import { ReactNode, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function AuthProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, fetchMe } = useAuthStore();
  const location = useLocation();
  const calledRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !calledRef.current) {
      calledRef.current = true;
      fetchMe();
    }
  }, [isAuthenticated, fetchMe]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Agar hamma shartlar to‘g‘ri bo‘lsa, sahifani ko‘rsatish
  return <>{children}</>;
}
