"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRole: "admin" | "student";
};

export default function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role !== allowedRole) {
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/student");
      }

      return;
    }

    setIsAuthorized(true);
  }, [allowedRole, router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Загрузка...
      </div>
    );
  }

  return <>{children}</>;
}