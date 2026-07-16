"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/lib/login-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveAuthSession } from "@/lib/auth-session";
import { authApi } from "@/lib/practice-api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createAuthHref } from "@/lib/auth-return";
import { useApplicationReturnTo } from "@/hooks/useApplicationReturnTo";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const router = useRouter();
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const returnTo = useApplicationReturnTo();

  async function onSubmit(data: LoginFormData) {
    setLoginError("");

    try {
      const session = await authApi.login(data.email, data.password);
      saveAuthSession(session);
      router.push(
        session.user.role === "admin" ? "/admin" : returnTo ?? "/student",
      );
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Не удалось войти");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-[420px]">
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            Вход в систему
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div>
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="Введите email"
                {...register("email")}
              />

              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">
                Пароль
              </Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль"
                  {...register("password")}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {loginError && (
              <p className="text-center text-red-500 text-sm">
                {loginError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Вход..." : "Войти"}
            </Button>

            <p className="text-center text-sm text-slate-600">
              Нет аккаунта?{" "}
              <Link
                href={createAuthHref("/register", returnTo)}
                className="text-blue-600 hover:underline"
              >
                Зарегистрироваться
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
