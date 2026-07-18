"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApplicationAnswerFields, {
  buildApplicationAnswerInputs,
  createApplicationAnswerMap,
  validateApplicationAnswers,
  type ApplicationAnswerMap,
  type ApplicationValidationErrors,
} from "@/components/applications/application-answer-fields";
import { createAuthHref } from "@/lib/auth-return";
import { getAuthSession } from "@/lib/auth-session";
import { applicationsApi, cohortsApi } from "@/lib/practice-api";
import type { ApplicationAnswerInput, PublicCohort } from "@/types/api";

type PublicApplicationFormProps = {
  publicSlug: string;
};

function getDraftKey(publicSlug: string) {
  return `applicationDraft:${publicSlug}`;
}

function readDraft(publicSlug: string): ApplicationAnswerMap {
  try {
    const value = sessionStorage.getItem(getDraftKey(publicSlug));
    return value ? (JSON.parse(value) as ApplicationAnswerMap) : {};
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
  const [answers, setAnswers] = useState<ApplicationAnswerMap>({});
  const [validationErrors, setValidationErrors] = useState<ApplicationValidationErrors>({});
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
        let autofill: ApplicationAnswerMap = {};

        if (session?.user.role === "student") {
          try {
            const response = await applicationsApi.getAutofill(loadedCohort.id);
            autofill = createApplicationAnswerMap(response.answers);
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

  function updateAnswer(fieldId: string, answer: ApplicationAnswerInput) {
    setAnswers((current) => ({
      ...current,
      [fieldId]: answer,
    }));
    setValidationErrors((current) => ({ ...current, [fieldId]: "" }));
  }

  function validate() {
    const errors = validateApplicationAnswers(fields, answers);

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

    const applicationAnswers = buildApplicationAnswerInputs(fields, answers);

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

            <ApplicationAnswerFields
              fields={fields}
              answers={answers}
              validationErrors={validationErrors}
              onAnswerChange={updateAnswer}
            />

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
