import { JSX, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
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

  return children;
}
