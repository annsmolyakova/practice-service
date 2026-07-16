"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  LoginFormData,
} from "@/lib/login-schema";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { users } from "@/mock/users";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver:
      zodResolver(loginSchema),
  });

  const router = useRouter();

  const [loginError, setLoginError] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  function onSubmit(
    data: LoginFormData
  ) {
    const user = users.find(
      (user) =>
        user.email ===
          data.email &&
        user.password ===
          data.password
    );

    if (!user) {
      setLoginError(
        "Неверный email или пароль"
      );

      return;
    }

    setLoginError("");

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    if (user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/student");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <Card className="w-[450px] rounded-3xl border-0 shadow-2xl bg-white/90 backdrop-blur-xl">
        <CardHeader>

          <CardTitle className="text-4xl text-center font-bold tracking-tight">
            Вход в систему
          </CardTitle>

          <p className="text-center text-slate-500 mt-2">
            Авторизация в сервисе
            организации практики
          </p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(
              onSubmit
            )}
            className="space-y-5"
          >
            <div>
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="Введите email"
                className="h-12 rounded-xl mt-2"
                {...register(
                  "email"
                )}
              />

              {errors.email && (
                <p className="text-red-500 text-sm mt-2">
                  {
                    errors.email
                      .message
                  }
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">
                Пароль
              </Label>

              <div className="relative mt-2">
                <Input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Введите пароль"
                  className="h-12 rounded-xl pr-12"
                  {...register(
                    "password"
                  )}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                >
                  {showPassword ? (
                    <EyeOff
                      size={20}
                    />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-2">
                  {
                    errors
                      .password
                      .message
                  }
                </p>
              )}
            </div>

            {loginError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                <p className="text-center text-red-500 text-sm">
                  {loginError}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-medium shadow-lg hover:scale-[1.02] transition-all"
            >
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}