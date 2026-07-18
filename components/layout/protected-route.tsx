"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRole: "admin" | "student";
};

export default function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { status, user, error, retry } = useAuth();
  const isAuthorized = user?.role === allowedRole;

  useEffect(() => {
    if (status === "loading" || status === "error") {
      return;
    }

    if (status === "unauthenticated" || !user) {
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
  }, [allowedRole, router, status, user]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="space-y-4 text-center">
          <p className="text-red-600">{error}</p>
          <Button type="button" variant="outline" onClick={retry}>
            Повторить
          </Button>
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Загрузка...
      </div>
    );
  }

  return <>{children}</>;
}
