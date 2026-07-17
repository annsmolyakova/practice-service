"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { reviewsApi } from "@/lib/practice-api";
import type { PracticeApplication, PracticeReview, UpsertPracticeReviewInput } from "@/types/api";

type PracticeReviewDialogProps = {
  application: PracticeApplication;
  onClose: () => void;
};

type ReviewForm = Omit<
  UpsertPracticeReviewInput,
  "activities" | "characteristic" | "employmentPosition" | "suggestions" | "grade" | "isReady"
> & {
  activities: string;
  characteristic: string;
  employmentPosition: string;
  suggestions: string;
  grade: string;
};

const EMPTY_FORM: ReviewForm = {
  activities: "",
  characteristic: "",
  isEmployed: null,
  employmentPosition: "",
  isNextPracticeOffered: null,
  isEmploymentOffered: null,
  suggestions: "",
  grade: "",
};

function toForm(review: PracticeReview | null): ReviewForm {
  if (!review) {
    return EMPTY_FORM;
  }

  return {
    activities: review.activities ?? "",
    characteristic: review.characteristic ?? "",
    isEmployed: review.isEmployed,
    employmentPosition: review.employmentPosition ?? "",
    isNextPracticeOffered: review.isNextPracticeOffered,
    isEmploymentOffered: review.isEmploymentOffered,
    suggestions: review.suggestions ?? "",
    grade: review.grade ?? "",
  };
}

function toBoolean(value: string | null): boolean | null {
  if (value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  return null;
}

function booleanValue(value: boolean | null) {
  return value === null ? "" : value ? "yes" : "no";
}

function validateReadyReview(form: ReviewForm) {
  if (!form.activities.trim()) return "Опишите деятельность студента";
  if (!form.characteristic.trim()) return "Заполните характеристику студента";
  if (form.isEmployed === null) return "Укажите статус трудоустройства";
  if (form.isNextPracticeOffered === null) return "Укажите статус приглашения на следующую практику";
  if (form.isEmploymentOffered === null) return "Укажите статус предложения работы";
  if (!form.suggestions.trim()) return "Заполните предложения и рекомендации";
  if (!form.grade.trim()) return "Укажите итоговую оценку";

  return "";
}

function nullableText(value: string) {
  return value.trim() || null;
}

export default function PracticeReviewDialog({
  application,
  onClose,
}: PracticeReviewDialogProps) {
  const [form, setForm] = useState<ReviewForm>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    reviewsApi
      .getByApplication(application.id)
      .then(({ review }) => {
        if (!isCancelled) {
          setForm(toForm(review));
          setIsReady(review?.isReady ?? false);
          setHasLoaded(true);
          setError("");
        }
      })
      .catch((loadError: unknown) => {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить отзыв");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [application.id, reloadKey]);

  function updateForm(changes: Partial<ReviewForm>) {
    setForm((current) => ({ ...current, ...changes }));
    setError("");
  }

  function retryLoading() {
    setIsLoading(true);
    setHasLoaded(false);
    setError("");
    setReloadKey((current) => current + 1);
  }

  async function saveReview(ready: boolean) {
    const validationError = ready ? validateReadyReview(form) : "";

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await reviewsApi.upsert(application.id, {
        activities: nullableText(form.activities),
        characteristic: nullableText(form.characteristic),
        isEmployed: form.isEmployed,
        employmentPosition: nullableText(form.employmentPosition),
        isNextPracticeOffered: form.isNextPracticeOffered,
        isEmploymentOffered: form.isEmploymentOffered,
        suggestions: nullableText(form.suggestions),
        grade: nullableText(form.grade),
        isReady: ready,
      });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось сохранить отзыв");
    } finally {
      setIsSaving(false);
    }
  }

  const studentName = application.user?.email ?? `Студент ${application.userId}`;

  return (
    <Dialog open onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Отзыв руководителя</DialogTitle>
          <DialogDescription>
            {studentName}. Черновик можно сохранить с незаполненными полями.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="py-8 text-center text-slate-600">Загрузка отзыва...</p>
        ) : !hasLoaded ? (
          <div className="space-y-4 py-8 text-center">
            <p className="text-red-600">{error || "Не удалось загрузить отзыв"}</p>
            <Button type="button" variant="outline" onClick={retryLoading}>
              Повторить
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {isReady && (
              <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                Отзыв завершён. После изменений его можно снова сохранить как черновик.
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="review-activities">Описание деятельности *</Label>
              <Textarea
                id="review-activities"
                maxLength={5000}
                value={form.activities}
                placeholder="Какие задачи выполнял студент"
                onChange={(event) => updateForm({ activities: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-characteristic">Характеристика *</Label>
              <Textarea
                id="review-characteristic"
                maxLength={5000}
                value={form.characteristic}
                placeholder="Профессиональные и личные качества студента"
                onChange={(event) => updateForm({ characteristic: event.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Трудоустроен *</Label>
                <Select
                  value={booleanValue(form.isEmployed)}
                  onValueChange={(value) => updateForm({ isEmployed: toBoolean(value) })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите вариант" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Да</SelectItem>
                    <SelectItem value="no">Нет</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-position">Должность</Label>
                <Input
                  id="review-position"
                  maxLength={255}
                  value={form.employmentPosition}
                  placeholder="Если студент трудоустроен"
                  onChange={(event) => updateForm({ employmentPosition: event.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Приглашён на следующую практику *</Label>
                <Select
                  value={booleanValue(form.isNextPracticeOffered)}
                  onValueChange={(value) =>
                    updateForm({ isNextPracticeOffered: toBoolean(value) })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите вариант" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Да</SelectItem>
                    <SelectItem value="no">Нет</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Предложена работа *</Label>
                <Select
                  value={booleanValue(form.isEmploymentOffered)}
                  onValueChange={(value) =>
                    updateForm({ isEmploymentOffered: toBoolean(value) })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите вариант" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Да</SelectItem>
                    <SelectItem value="no">Нет</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-suggestions">Предложения и рекомендации *</Label>
              <Textarea
                id="review-suggestions"
                maxLength={5000}
                value={form.suggestions}
                placeholder="Что студенту стоит развивать дальше"
                onChange={(event) => updateForm({ suggestions: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-grade">Оценка *</Label>
              <Input
                id="review-grade"
                maxLength={100}
                value={form.grade}
                placeholder="Например, отлично"
                onChange={(event) => updateForm({ grade: event.target.value })}
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" disabled={isSaving} onClick={onClose}>
                Отмена
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => void saveReview(false)}
              >
                {isSaving ? "Сохранение..." : "Сохранить черновик"}
              </Button>
              <Button type="button" disabled={isSaving} onClick={() => void saveReview(true)}>
                {isSaving ? "Сохранение..." : "Завершить отзыв"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
