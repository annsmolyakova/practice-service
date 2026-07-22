import { z } from "zod";

const requiredDate = z
  .string()
  .min(1, "Укажите дату")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Некорректный формат даты");

const requiredTime = z
  .string()
  .min(1, "Укажите время")
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Некорректный формат времени");

export function combineLocalDateTime(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes);
}

export const cohortSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Введите название когорты")
      .max(255, "Название не должно превышать 255 символов"),
    description: z
      .string()
      .trim()
      .max(2000, "Описание не должно превышать 2000 символов"),
    publicSlug: z
      .string()
      .trim()
      .min(1, "Введите публичный идентификатор")
      .max(100, "Идентификатор не должен превышать 100 символов")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Используйте строчные латинские буквы, цифры и дефисы",
      ),
    applicationStartsAtDate: requiredDate,
    applicationStartsAtTime: requiredTime,
    applicationEndsAtDate: requiredDate,
    applicationEndsAtTime: requiredTime,
    startsAtDate: requiredDate,
    startsAtTime: requiredTime,
    endsAtDate: requiredDate,
    endsAtTime: requiredTime,
    isActive: z.boolean(),
    isPubliclyListed: z.boolean(),
  })
  .superRefine((data, context) => {
    const values = [
      data.applicationStartsAtDate,
      data.applicationStartsAtTime,
      data.applicationEndsAtDate,
      data.applicationEndsAtTime,
      data.startsAtDate,
      data.startsAtTime,
      data.endsAtDate,
      data.endsAtTime,
    ];

    if (values.some((value) => !value)) {
      return;
    }

    const applicationStartsAt = combineLocalDateTime(
      data.applicationStartsAtDate,
      data.applicationStartsAtTime,
    );
    const applicationEndsAt = combineLocalDateTime(
      data.applicationEndsAtDate,
      data.applicationEndsAtTime,
    );
    const startsAt = combineLocalDateTime(data.startsAtDate, data.startsAtTime);
    const endsAt = combineLocalDateTime(data.endsAtDate, data.endsAtTime);

    if (applicationStartsAt >= applicationEndsAt) {
      context.addIssue({
        code: "custom",
        path: ["applicationEndsAtTime"],
        message: "Окончание приёма должно быть позже его начала",
      });
    }

    if (applicationEndsAt > startsAt) {
      context.addIssue({
        code: "custom",
        path: ["startsAtTime"],
        message: "Практика не может начаться до окончания приёма заявок",
      });
    }

    if (startsAt >= endsAt) {
      context.addIssue({
        code: "custom",
        path: ["endsAtTime"],
        message: "Окончание практики должно быть позже её начала",
      });
    }
  });

export type CohortFormData = z.infer<typeof cohortSchema>;
