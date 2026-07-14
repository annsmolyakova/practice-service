"use client";

import {
  useState
} from "react";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";

import {
  getApplications,
  saveApplications,
} from "@/lib/application-storage";

import { cohorts } from "@/mock/cohorts";

import type { Application } from "@/types/application";

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

export default function StudentApplicationsPage() {
  const [applicationList, setApplicationList] =
    useState<Application[]>(
      getApplications()
    );

  const [isOpen, setIsOpen] =
    useState(false);

  const [fullName, setFullName] =
    useState("");

  const [group, setGroup] =
    useState("");

  const [course, setCourse] =
    useState("");

  const [desiredRole, setDesiredRole] =
    useState("");

  const [stack, setStack] =
    useState("");

  function handleCreateApplication() {
    if (
      !fullName ||
      !group ||
      !course ||
      !desiredRole ||
      !stack
    ) {
      alert("Заполните все поля");
      return;
    }

    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    const newApplication: Application = {
      id: applicationList.length + 1,
      userId: user.id,
      cohortId: cohorts[0].id,

      fullName,
      group,
      course,

      desiredRole,
      stack,

      status: "pending",
      reviewComment: "",
      assignedRole: "",
    };

    const updatedApplications = [
      ...applicationList,
      newApplication,
    ];

    setApplicationList(
      updatedApplications
    );

    saveApplications(
      updatedApplications
    );

    setFullName("");
    setGroup("");
    setCourse("");
    setDesiredRole("");
    setStack("");

    setIsOpen(false);
  }

  function getStatusText(
    status: string
  ) {
    switch (status) {
      case "approved":
        return "Одобрена";

      case "rejected":
        return "Отклонена";

      default:
        return "На рассмотрении";
    }
  }

  const [userId] =
    useState<number | null>(() => {
      if (
        typeof window ===
        "undefined"
      ) {
        return null;
      }

      const storedUser =
        localStorage.getItem(
          "user"
        );

      if (!storedUser) {
        return null;
      }

      const user =
        JSON.parse(storedUser);

      return user.id;
    });

  const myApplications =
    applicationList.filter(
      (application) =>
        application.userId === userId
    );

  const hasPendingApplication =
  myApplications.some(
    (application) =>
      application.status ===
        "pending" ||
      application.status ===
        "approved"
  );

  return (
    <ProtectedRoute allowedRole="student">
      <DashboardLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            Мои заявки
          </h1>
          <Button
            disabled={hasPendingApplication}
            onClick={() => setIsOpen(true)}
          >
            {hasPendingApplication
              ? "Заявка уже подана"
              : "Подать заявку"}
          </Button>
        </div>

        <div className="space-y-6">
          {myApplications.map(
            (application) => (
              <Card
                key={application.id}
              >
                <CardHeader>
                  <CardTitle>
                    Заявка в когорту{" "}
                    {
                      cohorts.find(
                        (cohort) =>
                          cohort.id ===
                          application.cohortId
                      )?.name
                    }
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                  <p>
                    <b>ФИО:</b>{" "}
                    {
                      application.fullName
                    }
                  </p>

                  <p>
                    <b>Группа:</b>{" "}
                    {
                      application.group
                    }
                  </p>

                  <p>
                    <b>Курс:</b>{" "}
                    {
                      application.course
                    }
                  </p>

                  <p>
                    <b>
                      Желаемая роль:
                    </b>{" "}
                    {
                      application.desiredRole
                    }
                  </p>

                  <p>
                    <b>
                      Стек:
                    </b>{" "}
                    {
                      application.stack
                    }
                  </p>

                  <p>
                    <b>
                      Статус:
                    </b>{" "}
                    {getStatusText(
                      application.status
                    )}
                  </p>

                  {application.assignedRole && (
                    <p>
                      <b>
                        Назначенная роль:
                      </b>{" "}
                      {
                        application.assignedRole
                      }
                    </p>
                  )}

                  {application.reviewComment && (
                    <p>
                      <b>
                        Комментарий:
                      </b>{" "}
                      {
                        application.reviewComment
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </div>

        <Dialog
          open={isOpen}
          onOpenChange={
            setIsOpen
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Новая заявка
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>
                  ФИО
                </Label>

                <Input
                  value={
                    fullName
                  }
                  onChange={(e) =>
                    setFullName(
                      e.target
                        .value
                    )
                  }
                />
              </div>

              <div>
                <Label>
                  Группа
                </Label>

                <Input
                  value={group}
                  onChange={(e) =>
                    setGroup(
                      e.target
                        .value
                    )
                  }
                />
              </div>

              <div>
                <Label>
                  Курс
                </Label>

                <Input
                  value={course}
                  onChange={(e) =>
                    setCourse(
                      e.target
                        .value
                    )
                  }
                />
              </div>

              <div>
                <Label>
                  Желаемая роль
                </Label>

                <Input
                  value={
                    desiredRole
                  }
                  onChange={(e) =>
                    setDesiredRole(
                      e.target
                        .value
                    )
                  }
                />
              </div>

              <div>
                <Label>
                  Стек технологий
                </Label>

                <Input
                  value={stack}
                  onChange={(e) =>
                    setStack(
                      e.target
                        .value
                    )
                  }
                />
              </div>

              <Button
                className="w-full"
                onClick={
                  handleCreateApplication
                }
              >
                Отправить заявку
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}