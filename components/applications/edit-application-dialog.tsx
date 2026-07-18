"use client";

import { FormEvent, useEffect, useState } from "react";

import ApplicationAnswerFields, {
  buildApplicationAnswerInputs,
  createApplicationAnswerMap,
  validateApplicationAnswers,
  type ApplicationAnswerMap,
  type ApplicationValidationErrors,
} from "@/components/applications/application-answer-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { applicationsApi, cohortsApi } from "@/lib/practice-api";
import type {
  ApplicationAnswerInput,
  CohortFormField,
  PracticeApplication,
} from "@/types/api";

type EditApplicationDialogProps = {
  application: PracticeApplication;
  onClose: () => void;
  onUpdated: (application: PracticeApplication) => void;
};

export default function EditApplicationDialog({
  application,
  onClose,
  onUpdated,
}: EditApplicationDialogProps) {
  const [fields, setFields] = useState<CohortFormField[]>([]);
  const [answers, setAnswers] = useState<ApplicationAnswerMap>(() =>
    createApplicationAnswerMap(application.answers),
  );
  const [validationErrors, setValidationErrors] =
    useState<ApplicationValidationErrors>({});
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    cohortsApi
      .getPublic(application.cohort.publicSlug)
      .then(({ cohort }) => {
        if (isCancelled) {
          return;
        }

        setFields([...cohort.form.fields].sort((left, right) => left.sortOrder - right.sortOrder));
        setIsApplicationOpen(cohort.isApplicationOpen);
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Не удалось загрузить форму заявки",
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
  }, [application.cohort.publicSlug, reloadKey]);

  const canSave = application.status === "pending" && isApplicationOpen;

  function updateAnswer(fieldId: string, answer: ApplicationAnswerInput) {
    setAnswers((current) => ({ ...current, [fieldId]: answer }));
    setValidationErrors((current) => ({ ...current, [fieldId]: "" }));
    setSaveError("");
  }

  function retryLoading() {
    setIsLoading(true);
    setLoadError("");
    setReloadKey((current) => current + 1);
  }

  async function saveApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError("");

    if (!canSave) {
      return;
    }

    const errors = validateApplicationAnswers(fields, answers);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSaving(true);

    try {
      const { application: updatedApplication } = await applicationsApi.update(
        application.id,
        { answers: buildApplicationAnswerInputs(fields, answers) },
      );
      onUpdated(updatedApplication);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Не удалось сохранить заявку");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактирование заявки: {application.cohort.title}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="py-8 text-center text-slate-600">Загрузка формы...</p>
        ) : loadError ? (
          <div className="space-y-4 py-6 text-center">
            <p className="text-red-600">{loadError}</p>
            <Button type="button" variant="outline" onClick={retryLoading}>
              Повторить
            </Button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={saveApplication}>
            {!isApplicationOpen && (
              <p className="rounded-lg bg-amber-50 p-4 text-amber-800">
                Приём заявок в эту когорту закрыт. Редактирование недоступно.
              </p>
            )}

            {application.status !== "pending" && (
              <p className="rounded-lg bg-amber-50 p-4 text-amber-800">
                Редактировать можно только заявку на рассмотрении.
              </p>
            )}

            {fields.length === 0 && (
              <p className="text-slate-600">Дополнительные данные не требуются.</p>
            )}

            <ApplicationAnswerFields
              fields={fields}
              answers={answers}
              validationErrors={validationErrors}
              disabled={!canSave || isSaving}
              onAnswerChange={updateAnswer}
            />

            {saveError && <p className="text-sm text-red-600">{saveError}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" disabled={isSaving} onClick={onClose}>
                Закрыть
              </Button>
              <Button type="submit" disabled={!canSave || isSaving}>
                {isSaving ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
