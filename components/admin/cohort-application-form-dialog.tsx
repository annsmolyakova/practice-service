"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cohortsApi } from "@/lib/practice-api";
import type { Cohort, CohortFormField } from "@/types/api";

type EditableOption = {
  id: string;
  label: string;
  value: string;
};

type EditableField = {
  id: string;
  key: string;
  label: string;
  type: CohortFormField["type"];
  isRequired: boolean;
  options: EditableOption[];
};

type CohortApplicationFormDialogProps = {
  cohort: Cohort;
  onClose: () => void;
};

const FIELD_TYPE_LABELS: Record<CohortFormField["type"], string> = {
  text: "Текст",
  select: "Выбор из списка",
};

function createId() {
  return crypto.randomUUID();
}

function createOption(): EditableOption {
  return { id: createId(), label: "", value: "" };
}

function createField(): EditableField {
  return {
    id: createId(),
    key: "",
    label: "",
    type: "text",
    isRequired: true,
    options: [],
  };
}

function toEditableField(field: CohortFormField): EditableField {
  return {
    id: field.id,
    key: field.key,
    label: field.label,
    type: field.type,
    isRequired: field.isRequired,
    options: [...field.options]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((option) => ({
        id: option.id,
        label: option.label,
        value: option.value,
      })),
  };
}

function validateFields(fields: EditableField[]) {
  const keys = new Set<string>();

  for (const [fieldIndex, field] of fields.entries()) {
    const fieldNumber = fieldIndex + 1;
    const key = field.key.trim();

    if (!field.label.trim()) {
      return `Укажите название поля №${fieldNumber}`;
    }

    if (!/^[a-z][a-zA-Z0-9]*$/.test(key)) {
      return `Ключ поля «${field.label}» должен быть в camelCase`;
    }

    if (keys.has(key)) {
      return `Ключ «${key}» используется несколько раз`;
    }

    keys.add(key);

    if (field.type === "select") {
      if (field.options.length === 0) {
        return `Добавьте варианты для поля «${field.label}»`;
      }

      const values = new Set<string>();

      for (const option of field.options) {
        const label = option.label.trim();
        const value = option.value.trim();

        if (!label || !value) {
          return `Заполните названия и значения вариантов поля «${field.label}»`;
        }

        if (values.has(value)) {
          return `Значение «${value}» повторяется в поле «${field.label}»`;
        }

        values.add(value);
      }
    }
  }

  return "";
}

export default function CohortApplicationFormDialog({
  cohort,
  onClose,
}: CohortApplicationFormDialogProps) {
  const [fields, setFields] = useState<EditableField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    cohortsApi
      .getForm(cohort.id)
      .then((response) => {
        if (!isCancelled) {
          setFields(
            [...response.fields]
              .sort((left, right) => left.sortOrder - right.sortOrder)
              .map(toEditableField),
          );
          setError("");
          setHasLoaded(true);
        }
      })
      .catch((loadError: unknown) => {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить анкету");
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
  }, [cohort.id, reloadKey]);

  function retryLoading() {
    setIsLoading(true);
    setHasLoaded(false);
    setError("");
    setReloadKey((current) => current + 1);
  }

  function updateField(fieldId: string, changes: Partial<EditableField>) {
    setFields((current) =>
      current.map((field) => (field.id === fieldId ? { ...field, ...changes } : field)),
    );
    setError("");
  }

  function changeFieldType(field: EditableField, type: EditableField["type"]) {
    updateField(field.id, {
      type,
      options: type === "select" ? field.options.length > 0 ? field.options : [createOption()] : [],
    });
  }

  function removeField(fieldId: string) {
    setFields((current) => current.filter((field) => field.id !== fieldId));
    setError("");
  }

  function moveField(fieldIndex: number, offset: -1 | 1) {
    setFields((current) => {
      const targetIndex = fieldIndex + offset;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[fieldIndex], next[targetIndex]] = [next[targetIndex], next[fieldIndex]];
      return next;
    });
  }

  function updateOption(fieldId: string, optionId: string, changes: Partial<EditableOption>) {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              options: field.options.map((option) =>
                option.id === optionId ? { ...option, ...changes } : option,
              ),
            }
          : field,
      ),
    );
    setError("");
  }

  function addOption(fieldId: string) {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId ? { ...field, options: [...field.options, createOption()] } : field,
      ),
    );
  }

  function removeOption(fieldId: string, optionId: string) {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? { ...field, options: field.options.filter((option) => option.id !== optionId) }
          : field,
      ),
    );
  }

  function moveOption(fieldId: string, optionIndex: number, offset: -1 | 1) {
    setFields((current) =>
      current.map((field) => {
        if (field.id !== fieldId) {
          return field;
        }

        const targetIndex = optionIndex + offset;

        if (targetIndex < 0 || targetIndex >= field.options.length) {
          return field;
        }

        const options = [...field.options];
        [options[optionIndex], options[targetIndex]] = [options[targetIndex], options[optionIndex]];
        return { ...field, options };
      }),
    );
  }

  async function saveForm() {
    const validationError = validateFields(fields);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await cohortsApi.replaceForm(
        cohort.id,
        fields.map((field, fieldIndex) => ({
          key: field.key.trim(),
          label: field.label.trim(),
          type: field.type,
          isRequired: field.isRequired,
          sortOrder: fieldIndex,
          options: field.options.map((option, optionIndex) => ({
            label: option.label.trim(),
            value: option.value.trim(),
            sortOrder: optionIndex,
          })),
        })),
      );
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось сохранить анкету");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Анкета: {cohort.title}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="py-8 text-center text-slate-600">Загрузка анкеты...</p>
        ) : !hasLoaded ? (
          <div className="space-y-4 py-8 text-center">
            <p className="text-red-600">{error || "Не удалось загрузить анкету"}</p>
            <Button type="button" variant="outline" onClick={retryLoading}>
              Повторить
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {fields.length === 0 && !error && (
              <p className="rounded-lg bg-slate-50 p-4 text-slate-600">
                В анкете пока нет полей. Добавьте первое поле.
              </p>
            )}

            {fields.map((field, fieldIndex) => (
              <section key={field.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium">Поле {fieldIndex + 1}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={fieldIndex === 0}
                      onClick={() => moveField(fieldIndex, -1)}
                    >
                      Выше
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={fieldIndex === fields.length - 1}
                      onClick={() => moveField(fieldIndex, 1)}
                    >
                      Ниже
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeField(field.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`field-label-${field.id}`}>Название</Label>
                    <Input
                      id={`field-label-${field.id}`}
                      value={field.label}
                      placeholder="Например, Учебная группа"
                      onChange={(event) => updateField(field.id, { label: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`field-key-${field.id}`}>Ключ (camelCase)</Label>
                    <Input
                      id={`field-key-${field.id}`}
                      value={field.key}
                      placeholder="academicGroup"
                      onChange={(event) => updateField(field.id, { key: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Тип поля</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value) =>
                        changeFieldType(field, (value ?? "text") as EditableField["type"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue>{FIELD_TYPE_LABELS[field.type]}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Текст</SelectItem>
                        <SelectItem value="select">Выбор из списка</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <label className="flex items-center gap-2 self-end pb-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={field.isRequired}
                      onChange={(event) =>
                        updateField(field.id, { isRequired: event.target.checked })
                      }
                    />
                    Обязательное поле
                  </label>
                </div>

                {field.type === "select" && (
                  <div className="space-y-3 rounded-lg bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-medium">Варианты ответа</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(field.id)}
                      >
                        Добавить вариант
                      </Button>
                    </div>

                    {field.options.map((option, optionIndex) => (
                      <div key={option.id} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                        <Input
                          value={option.label}
                          aria-label={`Название варианта ${optionIndex + 1}`}
                          placeholder="Название"
                          onChange={(event) =>
                            updateOption(field.id, option.id, { label: event.target.value })
                          }
                        />
                        <Input
                          value={option.value}
                          aria-label={`Значение варианта ${optionIndex + 1}`}
                          placeholder="Значение"
                          onChange={(event) =>
                            updateOption(field.id, option.id, { value: event.target.value })
                          }
                        />
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={optionIndex === 0}
                            onClick={() => moveOption(field.id, optionIndex, -1)}
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={optionIndex === field.options.length - 1}
                            onClick={() => moveOption(field.id, optionIndex, 1)}
                          >
                            ↓
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            aria-label={`Удалить вариант ${optionIndex + 1}`}
                            onClick={() => removeOption(field.id, option.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}

            {error && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFields((current) => [...current, createField()])}
              >
                Добавить поле
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" disabled={isSaving} onClick={onClose}>
                  Отмена
                </Button>
                <Button type="button" disabled={isSaving} onClick={() => void saveForm()}>
                  {isSaving ? "Сохранение..." : "Сохранить анкету"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
