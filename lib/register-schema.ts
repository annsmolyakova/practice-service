import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .email("Введите корректный email"),

    password: z
      .string()
      .min(
        8,
        "Пароль должен содержать минимум 8 символов"
      ),

    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Пароли не совпадают",
      path: ["confirmPassword"],
    }
  );

export type RegisterFormData =
  z.infer<typeof registerSchema>;