import { z } from "zod";

export function isSafeArtifactLink(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const practiceTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Введите название задачи")
    .max(200, "Название не должно превышать 200 символов"),
  description: z
    .string()
    .trim()
    .min(1, "Введите описание задачи")
    .max(5000, "Описание не должно превышать 5000 символов"),
  artifactLink: z
    .string()
    .trim()
    .refine(
      (value) => !value || isSafeArtifactLink(value),
      "Введите ссылку, начинающуюся с http:// или https://",
    ),
});

export type PracticeTaskFormData = z.infer<typeof practiceTaskSchema>;
