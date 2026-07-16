"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";

import {
  getDocuments,
} from "@/lib/document-storage";

import type { Document } from "@/types/document";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function StudentDocumentsPage() {
  const documents: Document[] =
    getDocuments();

  const user =
    typeof window !== "undefined"
      ? JSON.parse(
          localStorage.getItem(
            "user"
          ) || "{}"
        )
      : null;

  const myDocuments =
    documents.filter(
      (document) =>
        document.userId ===
        user?.id
    );

  function getStatusText(
    status: Document["status"]
  ) {
    switch (status) {
      case "signed":
        return "Подписан";

      case "issued":
        return "Выдан";

      default:
        return "Подготовлен";
    }
  }

  function downloadDocument(
    fileName: string
  ) {
    const content =
      `Документ: ${fileName}`;

    const blob = new Blob(
      [content],
      {
        type: "text/plain",
      }
    );

    const url =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;
    link.download = fileName;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    window.URL.revokeObjectURL(
      url
    );
  }

  return (
    <ProtectedRoute allowedRole="student">
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Мои документы
          </h1>
        </div>

        {myDocuments.length ===
          0 && (
          <Card>
            <CardContent className="py-10 text-center">
              Для вас пока нет
              доступных
              документов.
            </CardContent>
          </Card>
        )}

        {myDocuments.length >
          0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Список
                документов
              </CardTitle>
            </CardHeader>

            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">
                      Документ
                    </th>

                    <th className="text-left py-3">
                      Файл
                    </th>

                    <th className="text-left py-3">
                      Статус
                    </th>

                    <th className="text-left py-3">
                      Дата создания
                    </th>

                    <th className="text-left py-3">
                      Скачать
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {myDocuments.map(
                    (
                      document
                    ) => (
                      <tr
                        key={
                          document.id
                        }
                        className="border-b"
                      >
                        <td className="py-4">
                          {
                            document.type
                          }
                        </td>

                        <td>
                          {
                            document.fileName
                          }
                        </td>

                        <td>
                          {getStatusText(
                            document.status
                          )}
                        </td>

                        <td>
                          {
                            document.createdAt
                          }
                        </td>

                        <td>
                          <Button
                            size="sm"
                            onClick={() =>
                              downloadDocument(
                                document.fileName
                              )
                            }
                          >
                            Скачать
                          </Button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}