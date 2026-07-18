import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ApplicationAnswerInput,
  CohortFormField,
} from "@/types/api";

export type ApplicationAnswerMap = Record<string, ApplicationAnswerInput>;
export type ApplicationValidationErrors = Record<string, string>;

type StoredApplicationAnswer = {
  fieldId: string;
  value?: string | null;
  optionId?: string | null;
};

type ApplicationAnswerFieldsProps = {
  fields: CohortFormField[];
  answers: ApplicationAnswerMap;
  validationErrors: ApplicationValidationErrors;
  disabled?: boolean;
  onAnswerChange: (fieldId: string, answer: ApplicationAnswerInput) => void;
};

export function createApplicationAnswerMap(
  answers: StoredApplicationAnswer[],
): ApplicationAnswerMap {
  return Object.fromEntries(
    answers.map((answer) => [
      answer.fieldId,
      {
        fieldId: answer.fieldId,
        ...(answer.value != null ? { value: answer.value } : {}),
        ...(answer.optionId != null ? { optionId: answer.optionId } : {}),
      },
    ]),
  );
}

export function validateApplicationAnswers(
  fields: CohortFormField[],
  answers: ApplicationAnswerMap,
): ApplicationValidationErrors {
  const errors: ApplicationValidationErrors = {};

  for (const field of fields) {
    if (!field.isRequired) {
      continue;
    }

    const answer = answers[field.id];
    const isEmpty = field.type === "text"
      ? !answer?.value?.trim()
      : !field.options.some((option) => option.id === answer?.optionId);

    if (isEmpty) {
      errors[field.id] = "Обязательное поле";
    }
  }

  return errors;
}

export function buildApplicationAnswerInputs(
  fields: CohortFormField[],
  answers: ApplicationAnswerMap,
): ApplicationAnswerInput[] {
  return fields.flatMap<ApplicationAnswerInput>((field) => {
    const answer = answers[field.id];

    if (!answer) {
      return [];
    }

    if (field.type === "text") {
      const value = answer.value?.trim();
      return value ? [{ fieldId: field.id, value }] : [];
    }

    const selectedOption = field.options.find((option) => option.id === answer.optionId);

    return selectedOption ? [{ fieldId: field.id, optionId: selectedOption.id }] : [];
  });
}

export default function ApplicationAnswerFields({
  fields,
  answers,
  validationErrors,
  disabled = false,
  onAnswerChange,
}: ApplicationAnswerFieldsProps) {
  return fields.map((field) => (
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
          disabled={disabled}
          onChange={(event) =>
            onAnswerChange(field.id, { fieldId: field.id, value: event.target.value })
          }
        />
      ) : (
        <Select
          items={field.options.map((option) => ({
            label: option.label,
            value: option.id,
          }))}
          value={answers[field.id]?.optionId ?? null}
          disabled={disabled}
          onValueChange={(value) =>
            onAnswerChange(field.id, { fieldId: field.id, optionId: value ?? "" })
          }
        >
          <SelectTrigger id={field.id} aria-invalid={Boolean(validationErrors[field.id])}>
            <SelectValue placeholder="Выберите вариант" />
          </SelectTrigger>
          <SelectContent>
            {[...field.options]
              .sort((left, right) => left.sortOrder - right.sortOrder)
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
  ));
}
