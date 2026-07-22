"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  practiceProfileSchema,
  type PracticeProfileFormData,
} from "@/lib/practice-profile-schema";
import { profilesApi } from "@/lib/practice-api";
import type { PracticeProfile } from "@/types/api";

const EMPTY_PROFILE: PracticeProfileFormData = {
  fullName: "",
  fullNameGenitive: "",
  directionCode: "",
  directionName: "",
  educationProgram: "",
  group: "",
  urfuPracticeSupervisor: "",
  urfuPracticeSupervisorShortName: "",
  mainStageWorkList: "",
};

const PROFILE_FIELDS: Array<{
  name: keyof PracticeProfileFormData;
  label: string;
  placeholder: string;
  autoComplete?: string;
}> = [
  {
    name: "fullName",
    label: "ФИО",
    placeholder: "Иванов Иван Иванович",
    autoComplete: "name",
  },
  {
    name: "fullNameGenitive",
    label: "ФИО в родительном падеже",
    placeholder: "Иванова Ивана Ивановича",
  },
  {
    name: "directionCode",
    label: "Код направления",
    placeholder: "09.03.04",
  },
  {
    name: "directionName",
    label: "Наименование направления",
    placeholder: "Программная инженерия",
  },
  {
    name: "educationProgram",
    label: "Образовательная программа",
    placeholder: "Разработка программно-информационных систем",
  },
  {
    name: "group",
    label: "Группа",
    placeholder: "РИС-220941",
  },
  {
    name: "urfuPracticeSupervisor",
    label: "ФИО руководителя практики от УрФУ",
    placeholder: "Петров Пётр Петрович",
  },
  {
    name: "urfuPracticeSupervisorShortName",
    label: "Краткое ФИО руководителя практики от УрФУ",
    placeholder: "Петров П. П.",
  },
];

function toFormData(profile: PracticeProfile): PracticeProfileFormData {
  return {
    fullName: profile.fullName ?? "",
    fullNameGenitive: profile.fullNameGenitive ?? "",
    directionCode: profile.directionCode ?? "",
    directionName: profile.directionName ?? "",
    educationProgram: profile.educationProgram ?? "",
    group: profile.group ?? "",
    urfuPracticeSupervisor: profile.urfuPracticeSupervisor ?? "",
    urfuPracticeSupervisorShortName:
      profile.urfuPracticeSupervisorShortName ?? "",
    mainStageWorkList: profile.mainStageWorkList ?? "",
  };
}

export default function StudentPracticeProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PracticeProfileFormData>({
    resolver: zodResolver(practiceProfileSchema),
    defaultValues: EMPTY_PROFILE,
  });

  useEffect(() => {
    let isCancelled = false;

    profilesApi
      .getMine()
      .then(({ profile }) => {
        if (isCancelled || !profile) {
          return;
        }

        reset(toFormData(profile));
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Не удалось загрузить профиль",
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
  }, [reset]);

  async function saveProfile(data: PracticeProfileFormData) {
    setSaveError("");
    setIsSaved(false);

    try {
      const { profile } = await profilesApi.updateMine(data);

      reset(toFormData(profile));
      setIsSaved(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Не удалось сохранить профиль");
    }
  }

  return (
    <ProtectedRoute allowedRole="student">
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Профиль практики</h1>
          <p className="mt-2 text-slate-600">
            Эти данные используются при формировании документов по практике.
          </p>
        </div>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Данные студента</CardTitle>
            <CardDescription>
              Заполните все поля точно так, как они должны отображаться в документах.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading && <p className="text-slate-600">Загрузка профиля...</p>}

            {!isLoading && loadError && (
              <div className="space-y-4">
                <p className="text-red-600">{loadError}</p>
                <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                  Повторить
                </Button>
              </div>
            )}

            {!isLoading && !loadError && (
              <form className="space-y-5" onSubmit={handleSubmit(saveProfile)}>
                {PROFILE_FIELDS.map((field) => (
                  <div key={field.name}>
                    <Label htmlFor={field.name}>{field.label}</Label>
                    <Input
                      id={field.name}
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
                      aria-invalid={Boolean(errors[field.name])}
                      {...register(field.name, {
                        onChange: () => {
                          setIsSaved(false);
                          setSaveError("");
                        },
                      })}
                    />
                    {errors[field.name] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors[field.name]?.message}
                      </p>
                    )}
                  </div>
                ))}

                <div>
                  <Label htmlFor="mainStageWorkList">
                    Перечень работ основного этапа
                  </Label>
                  <Textarea
                    id="mainStageWorkList"
                    rows={6}
                    placeholder="Опишите работы, выполняемые во время основного этапа практики"
                    aria-invalid={Boolean(errors.mainStageWorkList)}
                    {...register("mainStageWorkList", {
                      onChange: () => {
                        setIsSaved(false);
                        setSaveError("");
                      },
                    })}
                  />
                  {errors.mainStageWorkList && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.mainStageWorkList.message}
                    </p>
                  )}
                </div>

                {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                {isSaved && (
                  <p className="text-sm text-emerald-700">
                    Профиль сохранён и готов для формирования документов.
                  </p>
                )}

                <Button type="submit" disabled={isSubmitting || (!isDirty && isSaved)}>
                  {isSubmitting ? "Сохранение..." : "Сохранить профиль"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
