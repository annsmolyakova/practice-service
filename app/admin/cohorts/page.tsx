"use client";

import { useState } from "react";

import { cohorts } from "@/mock/cohorts";

import DashboardLayout from "@/components/layout/dashboard-layout";

import ProtectedRoute from "@/components/layout/protected-route";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CohortsPage() {
  const [isOpen, setIsOpen] = useState(false);

  const [cohortList, setCohortList] = useState(cohorts);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [applicationStart, setApplicationStart] = useState("");
  const [applicationEnd, setApplicationEnd] = useState("");
  const [practiceStart, setPracticeStart] = useState("");
  const [practiceEnd, setPracticeEnd] = useState("");

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("ru-RU");
  }

  function resetForm() {
    setEditingId(null);

    setName("");
    setApplicationStart("");
    setApplicationEnd("");
    setPracticeStart("");
    setPracticeEnd("");
  }

  function handleCreateCohort() {
    if (
      !name ||
      !applicationStart ||
      !applicationEnd ||
      !practiceStart ||
      !practiceEnd
    ) {
      alert("Заполните все поля");
      return;
    }

    if (editingId !== null) {
      setCohortList(
        cohortList.map((cohort) =>
          cohort.id === editingId
            ? {
                ...cohort,
                name,
                applicationStart,
                applicationEnd,
                practiceStart,
                practiceEnd,
              }
            : cohort
        )
      );
    } else {
      const newCohort = {
        id: Date.now(),
        name,
        applicationStart,
        applicationEnd,
        practiceStart,
        practiceEnd,
      };

      setCohortList((prev) => [...prev, newCohort]);
    }

    resetForm();
    setIsOpen(false);
  }

  function handleDeleteCohort(id: number) {
    setCohortList(
      cohortList.filter(
        (cohort) => cohort.id !== id
      )
    );
  }

  function handleEditCohort(cohort: typeof cohorts[number]) {
    setEditingId(cohort.id);

    setName(cohort.name);
    setApplicationStart(cohort.applicationStart);
    setApplicationEnd(cohort.applicationEnd);
    setPracticeStart(cohort.practiceStart);
    setPracticeEnd(cohort.practiceEnd);

    setIsOpen(true);
  }

  return (
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            Когорты
          </h1>

          <Button
            onClick={() => {
              resetForm();
              setIsOpen(true);
            }}
          >
            Создать когорту
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Список когорт
            </CardTitle>
          </CardHeader>

          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">
                    Год
                  </th>

                  <th className="text-left py-3">
                    Прием заявок
                  </th>

                  <th className="text-left py-3">
                    Практика
                  </th>

                  <th className="text-left py-3">
                    Действия
                  </th>
                </tr>
              </thead>

              <tbody>
                {cohortList.map((cohort) => (
                  <tr
                    key={cohort.id}
                    className="border-b"
                  >
                    <td className="py-4">
                      {cohort.name}
                    </td>

                    <td>
                      {formatDate(
                        cohort.applicationStart
                      )}{" "}
                      —{" "}
                      {formatDate(
                        cohort.applicationEnd
                      )}
                    </td>

                    <td>
                      {formatDate(
                        cohort.practiceStart
                      )}{" "}
                      —{" "}
                      {formatDate(
                        cohort.practiceEnd
                      )}
                    </td>

                    <td>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleEditCohort(
                              cohort
                            )
                          }
                        >
                          Редактировать
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDeleteCohort(
                              cohort.id
                            )
                          }
                        >
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Dialog
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId !== null
                  ? "Редактирование когорты"
                  : "Создание когорты"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">
                  Название когорты
                </Label>

                <Input
                  id="name"
                  placeholder="Например, 2028"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="applicationStart">
                  Начало приема заявок
                </Label>

                <Input
                  id="applicationStart"
                  type="date"
                  value={applicationStart}
                  onChange={(e) =>
                    setApplicationStart(
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="applicationEnd">
                  Окончание приема заявок
                </Label>

                <Input
                  id="applicationEnd"
                  type="date"
                  value={applicationEnd}
                  onChange={(e) =>
                    setApplicationEnd(
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="practiceStart">
                  Начало практики
                </Label>

                <Input
                  id="practiceStart"
                  type="date"
                  value={practiceStart}
                  onChange={(e) =>
                    setPracticeStart(
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="practiceEnd">
                  Окончание практики
                </Label>

                <Input
                  id="practiceEnd"
                  type="date"
                  value={practiceEnd}
                  onChange={(e) =>
                    setPracticeEnd(
                      e.target.value
                    )
                  }
                />
              </div>

              <Button
                className="w-full"
                onClick={handleCreateCohort}
              >
                {editingId !== null
                  ? "Сохранить изменения"
                  : "Создать когорту"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}