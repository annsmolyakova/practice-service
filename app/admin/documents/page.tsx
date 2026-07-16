"use client";

import { useState } from "react";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";

import {
  getDocuments,
  saveDocuments,
} from "@/lib/document-storage";

import {
  getApplications,
} from "@/lib/application-storage";

import type { Document } from "@/types/document";

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

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { documentTypes } from "@/constants/document-types";

export default function AdminDocumentsPage() {
  const [documentList, setDocumentList] =
    useState<Document[]>(
      getDocuments()
    );

  const [isOpen, setIsOpen] =
    useState(false);

  const [selectedUserId, setSelectedUserId] =
    useState<number | null>(null);

  const [selectedUserName, setSelectedUserName] =
    useState("");

  const [selectedType, setSelectedType] =
    useState("");

  const applications =
    getApplications();

  const approvedStudents =
    applications.filter(
      (application) =>
        application.status ===
        "approved"
    );

  function createDocument() {
    if (
      !selectedUserId ||
      !selectedType
    ) {
      alert(
        "Заполните все поля"
      );

      return;
    }

    const newDocument: Document = {
      id: Date.now(),

      userId: selectedUserId,

      userName:
        selectedUserName,

      type: selectedType,

      fileName:
        `${selectedType}.docx`,

      status: "created",

      createdAt:
        new Date().toLocaleDateString(
          "ru-RU"
        ),
    };

    const updatedDocuments = [
      ...documentList,
      newDocument,
    ];

    setDocumentList(
      updatedDocuments
    );

    saveDocuments(
      updatedDocuments
    );

    setSelectedUserId(
      null
    );

    setSelectedUserName(
      ""
    );

    setSelectedType(
      ""
    );

    setIsOpen(false);
  }

  function getStatusText(
    status: string
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

  return (
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            Документы
          </h1>

          <Button
            onClick={() =>
              setIsOpen(true)
            }
          >
            Создать документ
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Список документов
            </CardTitle>
          </CardHeader>

          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">
                    Студент
                  </th>

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
                    Дата
                  </th>
                </tr>
              </thead>

              <tbody>
                {documentList.map(
                  (document) => (
                    <tr
                      key={
                        document.id
                      }
                      className="border-b"
                    >
                      <td className="py-4">
                        {
                          document.userName
                        }
                      </td>

                      <td>
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
                    </tr>
                  )
                )}
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
                Создание документа
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>
                  Студент
                </Label>

                <Select
                  value={
                    selectedUserId?.toString() ||
                    ""
                  }
                  onValueChange={(
                    value
                  ) => {
                    const student =
                      approvedStudents.find(
                        (
                          application
                        ) =>
                          application.userId ===
                          Number(
                            value
                          )
                      );

                    setSelectedUserId(
                      Number(
                        value
                      )
                    );

                    setSelectedUserName(
                      student?.fullName ||
                        ""
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите студента" />
                  </SelectTrigger>

                  <SelectContent>
                    {approvedStudents.map(
                      (
                        student
                      ) => (
                        <SelectItem
                          key={
                            student.userId
                          }
                          value={student.userId.toString()}
                        >
                          {
                            student.fullName
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Тип документа
                </Label>

                <Select
                  value={
                    selectedType
                  }
                  onValueChange={(
                    value
                  ) =>
                    setSelectedType(
                      value ??
                        ""
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип документа" />
                  </SelectTrigger>

                  <SelectContent>
                    {documentTypes.map(
                      (
                        type
                      ) => (
                        <SelectItem
                          key={
                            type
                          }
                          value={
                            type
                          }
                        >
                          {
                            type
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={
                  createDocument
                }
              >
                Создать документ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}