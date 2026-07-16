"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAuthHref } from "@/lib/auth-return";
import { getAuthSession } from "@/lib/auth-session";
import { applicationsApi, cohortsApi } from "@/lib/practice-api";
import type { ApplicationAnswerInput, PublicCohort } from "@/types/api";

type PublicApplicationFormProps = {
  publicSlug: string;
};

type AnswerMap = Record<string, ApplicationAnswerInput>;
type ValidationErrors = Record<string, string>;

function getDraftKey(publicSlug: string) {
  return `applicationDraft:${publicSlug}`;
}

function answersToMap(answers: ApplicationAnswerInput[]): AnswerMap {
  return Object.fromEntries(answers.map((answer) => [answer.fieldId, answer]));
}

function readDraft(publicSlug: string): AnswerMap {
  try {
    const value = sessionStorage.getItem(getDraftKey(publicSlug));
    return value ? (JSON.parse(value) as AnswerMap) : {};
  } catch {
    sessionStorage.removeItem(getDraftKey(publicSlug));
    return {};
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function PublicApplicationForm({ publicSlug }: PublicApplicationFormProps) {
  const router = useRouter();
  const [cohort, setCohort] = useState<PublicCohort | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadApplicationForm() {
      setIsLoading(true);
      setLoadError("");

      try {
        const { cohort: loadedCohort } = await cohortsApi.getPublic(publicSlug);
        const session = getAuthSession();
        let autofill: AnswerMap = {};

        if (session?.user.role === "student") {
          try {
            const response = await applicationsApi.getAutofill(loadedCohort.id);
            autofill = answersToMap(response.answers);
          } catch {
            // Autofill is optional and must not block a new application.
          }
        }

        if (!isCancelled) {
          setCohort(loadedCohort);
          setAnswers({ ...autofill, ...readDraft(publicSlug) });
        }
      } catch (error) {
        if (!isCancelled) {
          setLoadError(error instanceof Error ? error.message : "Не удалось загрузить форму");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadApplicationForm();

    return () => {
      isCancelled = true;
    };
  }, [publicSlug]);

  const fields = useMemo(
    () => [...(cohort?.form.fields ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [cohort],
  );

  function updateTextAnswer(fieldId: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [fieldId]: { fieldId, value },
    }));
    setValidationErrors((current) => ({ ...current, [fieldId]: "" }));
  }

  function updateSelectAnswer(fieldId: string, optionId: string) {
    setAnswers((current) => ({
      ...current,
      [fieldId]: { fieldId, optionId },
    }));
    setValidationErrors((current) => ({ ...current, [fieldId]: "" }));
  }

  function validate() {
    const errors: ValidationErrors = {};

    for (const field of fields) {
      if (!field.isRequired) {
        continue;
      }

      const answer = answers[field.id];
      const isEmpty =
        field.type === "text" ? !answer?.value?.trim() : !answer?.optionId;

      if (isEmpty) {
        errors[field.id] = "Обязательное поле";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    if (!cohort || !validate()) {
      return;
    }

    const session = getAuthSession();

    if (!session) {
      sessionStorage.setItem(getDraftKey(publicSlug), JSON.stringify(answers));
      router.push(createAuthHref("/login", `/apply/${encodeURIComponent(publicSlug)}`));
      return;
    }

    if (session.user.role !== "student") {
      setSubmitError("Подать заявку может только студент");
      return;
    }

    const applicationAnswers = fields.flatMap<ApplicationAnswerInput>((field) => {
      const answer = answers[field.id];

      if (!answer) {
        return [];
      }

      if (field.type === "text") {
        const value = answer.value?.trim();
        return value ? [{ fieldId: field.id, value }] : [];
      }

      return answer.optionId ? [{ fieldId: field.id, optionId: answer.optionId }] : [];
    });

    setIsSubmitting(true);

    try {
      await applicationsApi.create(cohort.id, applicationAnswers);
      sessionStorage.removeItem(getDraftKey(publicSlug));
      router.push("/student/applications");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Не удалось отправить заявку");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="text-center text-slate-600">Загрузка формы...</p>;
  }

  if (loadError || !cohort) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-4 py-8 text-center">
          <p className="text-red-600">{loadError || "Когорта не найдена"}</p>
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Повторить
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl">{cohort.title}</CardTitle>
        {cohort.description && <p className="text-slate-600">{cohort.description}</p>}
        <p className="text-sm text-slate-500">
          Приём заявок: {formatDateTime(cohort.applicationStartsAt)} —{" "}
          {formatDateTime(cohort.applicationEndsAt)}
        </p>
      </CardHeader>

      <CardContent>
        {!cohort.isApplicationOpen ? (
          <p className="rounded-lg bg-amber-50 p-4 text-amber-800">
            Приём заявок в эту когорту сейчас закрыт.
          </p>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {fields.length === 0 && (
              <p className="text-slate-600">Дополнительные данные не требуются.</p>
            )}

            {fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.isRequired && <span className="text-red-600"> *</span>}
                </Label>

                {field.type === "text" ? (
                  <Input
                    id={field.id}
                    value={answers[field.id]?.value ?? ""}
                    aria-invalid={Boolean(validationErrors[field.id])}
                    onChange={(event) => updateTextAnswer(field.id, event.target.value)}
                  />
                ) : (
                  <Select
                    value={answers[field.id]?.optionId ?? ""}
                    onValueChange={(value) => updateSelectAnswer(field.id, value ?? "")}
                  >
                    <SelectTrigger id={field.id} aria-invalid={Boolean(validationErrors[field.id])}>
                      <SelectValue placeholder="Выберите вариант" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...field.options]
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}

                {validationErrors[field.id] && (
                  <p className="text-sm text-red-600">{validationErrors[field.id]}</p>
                )}
              </div>
            ))}

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Отправка..." : "Отправить заявку"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
