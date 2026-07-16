"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerSchema,
  RegisterFormData,
} from "@/lib/register-schema";

import { users } from "@/mock/users";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Eye,
  EyeOff,
} from "lucide-react";

import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver:
      zodResolver(registerSchema),
  });

  function onSubmit(
    data: RegisterFormData
  ) {
    const existingUser =
      users.find(
        (user) =>
          user.email ===
          data.email
      );

    if (existingUser) {
      alert(
        "Пользователь с таким email уже существует"
      );

      return;
    }

    const newUser = {
      id: users.length + 1,
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: "student" as const,
    };

    users.push(newUser);

    localStorage.setItem(
      "user",
      JSON.stringify(newUser)
    );

    router.push("/student");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <Card className="w-[480px] rounded-3xl border-0 shadow-2xl bg-white/90 backdrop-blur-xl">
        <CardHeader>

          <CardTitle className="text-4xl text-center font-bold tracking-tight">
            Регистрация
          </CardTitle>

          <p className="text-center text-slate-500 mt-2">
            Создание аккаунта в сервисе
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
              <Label htmlFor="fullName">
                ФИО
              </Label>

              <Input
                id="fullName"
                placeholder="Введите ФИО"
                className="h-12 rounded-xl mt-2"
                {...register(
                  "fullName"
                )}
              />

              {errors.fullName && (
                <p className="text-red-500 text-sm mt-2">
                  {
                    errors
                      .fullName
                      .message
                  }
                </p>
              )}
            </div>

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
                    <Eye
                      size={20}
                    />
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

            <div>
              <Label htmlFor="confirmPassword">
                Повторите пароль
              </Label>

              <div className="relative mt-2">
                <Input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Повторите пароль"
                  className="h-12 rounded-xl pr-12"
                  {...register(
                    "confirmPassword"
                  )}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff
                      size={20}
                    />
                  ) : (
                    <Eye
                      size={20}
                    />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-2">
                  {
                    errors
                      .confirmPassword
                      .message
                  }
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-medium shadow-lg hover:scale-[1.02] transition-all"
            >
              Зарегистрироваться
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}