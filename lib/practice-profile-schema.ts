import { z } from "zod";

const requiredText = (label: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `Укажите ${label}`)
    .max(maxLength, `Максимум ${maxLength} символов`);

export const practiceProfileSchema = z.object({
  fullName: requiredText("ФИО", 255),
  fullNameGenitive: requiredText("ФИО в родительном падеже", 255),
  directionCode: requiredText("код направления", 100),
  directionName: requiredText("наименование направления", 255),
  educationProgram: requiredText("образовательную программу", 255),
  group: requiredText("группу", 100),
  urfuPracticeSupervisor: requiredText(
    "ФИО руководителя практики от УрФУ",
    255,
  ),
  urfuPracticeSupervisorShortName: requiredText(
    "краткое ФИО руководителя практики от УрФУ",
    255,
  ),
  mainStageWorkList: requiredText("перечень работ основного этапа", 5000),
});

export type PracticeProfileFormData = z.infer<typeof practiceProfileSchema>;
