import { z } from "zod";

export const cohortAssignmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Введите название тестового задания")
    .max(255, "Название не должно превышать 255 символов"),
  description: z
    .string()
    .trim()
    .max(2000, "Описание не должно превышать 2000 символов"),
  content: z
    .string()
    .trim()
    .min(1, "Введите содержание тестового задания"),
  isPublished: z.boolean(),
});

export type CohortAssignmentFormData = z.infer<typeof cohortAssignmentSchema>;
