"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  cohortAssignmentSchema,
  type CohortAssignmentFormData,
} from "@/lib/cohort-assignment-schema";
import { assignmentsApi } from "@/lib/practice-api";
import type { Cohort } from "@/types/api";

type CohortAssignmentDialogProps = {
  cohort: Cohort;
  onClose: () => void;
};

const EMPTY_FORM: CohortAssignmentFormData = {
  title: "",
  description: "",
  content: "",
  isPublished: false,
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-red-500">{message}</p>;
}

export default function CohortAssignmentDialog({
  cohort,
  onClose,
}: CohortAssignmentDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CohortAssignmentFormData>({
    resolver: zodResolver(cohortAssignmentSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    let isCancelled = false;

    assignmentsApi
      .getByCohort(cohort.id)
      .then(({ assignment }) => {
        if (isCancelled) {
          return;
        }

        reset(
          assignment
            ? {
                title: assignment.title,
                description: assignment.description ?? "",
                content: assignment.content,
                isPublished: assignment.isPublished,
              }
            : EMPTY_FORM,
        );
        setError("");
        setHasLoaded(true);
      })
      .catch((loadError: unknown) => {
        if (!isCancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Не удалось загрузить тестовое задание",
          );
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
  }, [cohort.id, reloadKey, reset]);

  function retryLoading() {
    setIsLoading(true);
    setHasLoaded(false);
    setError("");
    setReloadKey((current) => current + 1);
  }

  function handleDialogChange(open: boolean) {
    if (!open && !isSubmitting) {
      onClose();
    }
  }

  async function saveAssignment(data: CohortAssignmentFormData) {
    setError("");

    try {
      await assignmentsApi.upsertByCohort(cohort.id, {
        title: data.title,
        description: data.description || null,
        content: data.content,
        isPublished: data.isPublished,
      });
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Не удалось сохранить тестовое задание",
      );
    }
  }

  return (
    <Dialog open onOpenChange={handleDialogChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Тестовое задание — {cohort.title}</DialogTitle>
        </DialogHeader>

        {isLoading && <p className="py-8 text-center text-slate-600">Загрузка задания...</p>}

        {!isLoading && !hasLoaded && (
          <div className="space-y-4 py-8 text-center">
            <p className="text-red-600">{error}</p>
            <Button type="button" variant="outline" onClick={retryLoading}>
              Повторить
            </Button>
          </div>
        )}

        {!isLoading && hasLoaded && (
          <form className="space-y-4" onSubmit={handleSubmit(saveAssignment)}>
            <div>
              <Label htmlFor="assignment-title">Название *</Label>
              <Input
                id="assignment-title"
                maxLength={255}
                aria-invalid={Boolean(errors.title)}
                {...register("title")}
              />
              <FieldError message={errors.title?.message} />
            </div>

            <div>
              <Label htmlFor="assignment-description">Краткое описание</Label>
              <Textarea
                id="assignment-description"
                maxLength={2000}
                rows={4}
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
              <FieldError message={errors.description?.message} />
            </div>

            <div>
              <Label htmlFor="assignment-content">Содержание задания *</Label>
              <Textarea
                id="assignment-content"
                rows={12}
                aria-invalid={Boolean(errors.content)}
                {...register("content")}
              />
              <FieldError message={errors.content?.message} />
            </div>

            <label className="flex items-start gap-3 rounded-lg border p-4 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 size-4"
                disabled={isSubmitting}
                {...register("isPublished")}
              />
              <span>
                <span className="block font-medium">Опубликовать задание</span>
                <span className="text-slate-600">
                  После публикации задание станет доступно студентам, подавшим заявку.
                </span>
              </span>
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
