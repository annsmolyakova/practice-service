import { z } from "zod";

const requiredText = (label: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `Укажите ${label}`)
    .max(maxLength, `Максимум ${maxLength} символов`);

export const practiceProfileSchema = z.object({
  fullName: requiredText("ФИО", 255),
  specialty: requiredText("специальность", 255),
  educationProgram: requiredText("образовательную программу", 255),
  group: requiredText("группу", 100),
});

export type PracticeProfileFormData = z.infer<typeof practiceProfileSchema>;
