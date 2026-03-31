import { redirect } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: any) {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    redirect("/login");
  }

  // Admin route protection
  if (requireAdmin && user.role !== "admin") {
    redirect("/dashboard");
  }

  return children;
}