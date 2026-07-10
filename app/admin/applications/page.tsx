"use client";

import { useState } from "react";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";

import {
  getApplications,
  saveApplications,
} from "@/lib/application-storage";

import type { Application } from "@/types/application";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

export default function AdminApplicationsPage() {
  const [applicationList, setApplicationList] =
    useState<Application[]>(
      getApplications()
    );

  const [rejectComment, setRejectComment] =
    useState("");

  function approveApplication(id: number) {
    const updatedApplications =
      applicationList.map(
        (application) =>
          application.id === id
            ? {
                ...application,
                status: "approved",
              }
            : application
      );

    setApplicationList(
      updatedApplications
    );

    saveApplications(
      updatedApplications
    );
  }

  function rejectApplication(id: number) {
    if (!rejectComment.trim()) {
      alert(
        "Введите комментарий перед отклонением"
      );

      return;
    }

    const updatedApplications =
      applicationList.map(
        (application) =>
          application.id === id
            ? {
                ...application,
                status: "rejected",
                reviewComment:
                  rejectComment,
              }
            : application
      );

    setApplicationList(
      updatedApplications
    );

    saveApplications(
      updatedApplications
    );

    setRejectComment("");
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

  return (
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Заявки студентов
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Все заявки
            </CardTitle>
          </CardHeader>

          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">
                    ФИО
                  </th>

                  <th className="text-left py-3">
                    Группа
                  </th>

                  <th className="text-left py-3">
                    Желаемая роль
                  </th>

                  <th className="text-left py-3">
                    Статус
                  </th>

                  <th className="text-left py-3">
                    Действия
                  </th>
                </tr>
              </thead>

              <tbody>
                {applicationList.map(
                  (application) => (
                    <tr
                      key={
                        application.id
                      }
                      className="border-b"
                    >
                      <td className="py-4">
                        {
                          application.fullName
                        }
                      </td>

                      <td>
                        {
                          application.group
                        }
                      </td>

                      <td>
                        {
                          application.desiredRole
                        }
                      </td>

                      <td>
                        {getStatusText(
                          application.status
                        )}
                      </td>

                      <td>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={
                              application.status !==
                              "pending"
                            }
                            onClick={() =>
                              approveApplication(
                                application.id
                              )
                            }
                          >
                            Одобрить
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={
                              application.status !==
                              "pending"
                            }
                            onClick={() =>
                              rejectApplication(
                                application.id
                              )
                            }
                          >
                            Отклонить
                          </Button>
                        </div>

                        {application.status ===
                          "rejected" && (
                          <p className="text-sm text-red-500 mt-2">
                            Причина:{" "}
                            {
                              application.reviewComment
                            }
                          </p>
                        )}

                        {application.assignedRole && (
                          <p className="text-sm text-green-600 mt-2">
                            Назначенная роль:{" "}
                            {
                              application.assignedRole
                            }
                          </p>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <div className="mt-6">
              <Input
                placeholder="Комментарий при отклонении"
                value={
                  rejectComment
                }
                onChange={(e) =>
                  setRejectComment(
                    e.target.value
                  )
                }
              />
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}