import { Role } from "@/shared/enums/role.enum";
import { useAuthStore } from "@/store/auth-store";
import { ReactNode, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function StudentProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, user, fetchMe } = useAuthStore();
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

  if (!user || user?.role !== Role.STUDENT) {
    return <Navigate to="/teacher" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
