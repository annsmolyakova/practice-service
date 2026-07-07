"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/lib/login-schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { users } from "@/mock/users";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const router = useRouter();
  const [loginError, setLoginError] = useState("");

  function onSubmit(data: LoginFormData) {
    const user = users.find(
      (user) =>
        user.email === data.email &&
        user.password === data.password
    );

    if (!user) {
      setLoginError("Неверный email или пароль");
      return;
    }

    setLoginError("");

    localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/student");
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

              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                {...register("password")}
              />

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

            <Button type="submit" className="w-full">
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}