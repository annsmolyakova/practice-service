"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/components/auth/auth-provider";
import {
  registerSchema,
  RegisterFormData,
} from "@/lib/register-schema";
import { authApi } from "@/lib/practice-api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { createAuthHref } from "@/lib/auth-return";
import { useApplicationReturnTo } from "@/hooks/useApplicationReturnTo";

export default function RegisterPage() {
  const router = useRouter();
  const { setSession } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [registerError, setRegisterError] = useState("");

  const returnTo = useApplicationReturnTo();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setRegisterError("");

    try {
      const session = await authApi.register(
        data.email,
        data.password,
      );

      setSession(session);

      router.push(returnTo ?? "/student");
    } catch (error) {
      setRegisterError(
        error instanceof Error
          ? error.message
          : "Не удалось зарегистрироваться",
      );
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8 sm:px-6">
      <Card className="w-full max-w-md rounded-3xl border-white/60 bg-white/90 shadow-2xl backdrop-blur-xl">
        <CardHeader className="px-6 pt-8 sm:px-8 sm:pt-10">
          <CardTitle className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Регистрация
          </CardTitle>

          <p className="mt-2 text-center text-sm text-slate-500">
            Создайте аккаунт, чтобы начать работу с сервисом
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-8 sm:px-8 sm:pb-10">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="Введите email"
                className="h-11 rounded-xl"
                {...register("email")}
              />

              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Пароль */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Пароль
              </Label>

              <div className="relative">
                <Input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Введите пароль"
                  className="h-11 rounded-xl pr-11"
                  {...register("password")}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-500 transition-colors hover:text-slate-900"
                  aria-label={
                    showPassword
                      ? "Скрыть пароль"
                      : "Показать пароль"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Подтверждение пароля */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Повторите пароль
              </Label>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Повторите пароль"
                  className="h-11 rounded-xl pr-11"
                  {...register("confirmPassword")}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword,
                    )
                  }
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-500 transition-colors hover:text-slate-900"
                  aria-label={
                    showConfirmPassword
                      ? "Скрыть пароль"
                      : "Показать пароль"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Ошибка регистрации */}
            {registerError && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                {registerError}
              </div>
            )}

            {/* Кнопка */}
            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-blue-600 font-medium shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Регистрация..."
                : "Зарегистрироваться"}
            </Button>

            {/* Ссылка на вход */}
            <p className="pt-2 text-center text-sm text-slate-600">
              Уже есть аккаунт?{" "}
              <Link
                href={createAuthHref("/login", returnTo)}
                className="font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
              >
                Войти
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}