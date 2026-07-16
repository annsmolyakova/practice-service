import type { UseFormRegisterReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CohortDateTimeFieldsProps = {
  label: string;
  dateId: string;
  timeId: string;
  dateRegistration: UseFormRegisterReturn;
  timeRegistration: UseFormRegisterReturn;
  dateError?: string;
  timeError?: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-red-500">{message}</p>;
}

export default function CohortDateTimeFields({
  label,
  dateId,
  timeId,
  dateRegistration,
  timeRegistration,
  dateError,
  timeError,
}: CohortDateTimeFieldsProps) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium">{label}</legend>
      <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
        <div>
          <Label htmlFor={dateId} className="sr-only">
            Дата
          </Label>
          <Input
            id={dateId}
            type="date"
            aria-label={`${label}: дата`}
            aria-invalid={Boolean(dateError)}
            {...dateRegistration}
          />
          <FieldError message={dateError} />
        </div>
        <div>
          <Label htmlFor={timeId} className="sr-only">
            Время
          </Label>
          <Input
            id={timeId}
            type="time"
            step={60}
            aria-label={`${label}: время`}
            aria-invalid={Boolean(timeError)}
            {...timeRegistration}
          />
          <FieldError message={timeError} />
        </div>
      </div>
    </fieldset>
  );
}
