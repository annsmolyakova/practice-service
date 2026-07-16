"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRole: "admin" | "student";
};

export default function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const user = useCurrentUser();
  const isAuthorized = user?.role === allowedRole;

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== allowedRole) {
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/student");
      }

      return;
    }
  }, [allowedRole, router, user]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Загрузка...
      </div>
    );
  }

  return <>{children}</>;
}
