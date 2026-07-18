import type { Cohort } from "@/types/api";

const DAYS_IN_WEEK = 7;
const WORK_DAYS_IN_WEEK = 5;

function parseDateOnly(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  return new Date(year, month - 1, day, 12);
}

export function formatDateOnlyValue(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addCalendarDays(value: string, days: number) {
  const date = parseDateOnly(value);
  date.setDate(date.getDate() + days);

  return formatDateOnlyValue(date);
}

export function getMonday(value: string) {
  const date = parseDateOnly(value);
  const weekday = date.getDay();
  const daysSinceMonday = weekday === 0 ? 6 : weekday - 1;

  date.setDate(date.getDate() - daysSinceMonday);

  return formatDateOnlyValue(date);
}

export function getInitialWeekStart(cohort: Cohort, now = new Date()) {
  const today = formatDateOnlyValue(now);
  const startsAt = cohort.startsAt.slice(0, 10);
  const endsAt = cohort.endsAt.slice(0, 10);
  const referenceDate = today < startsAt ? startsAt : today > endsAt ? endsAt : today;

  return getMonday(referenceDate);
}

export function getWorkWeekDates(weekStart: string) {
  return Array.from({ length: WORK_DAYS_IN_WEEK }, (_, index) =>
    addCalendarDays(weekStart, index),
  );
}

export function shiftWeek(weekStart: string, direction: -1 | 1) {
  return addCalendarDays(weekStart, direction * DAYS_IN_WEEK);
}

export function canShiftWeek(cohort: Cohort, weekStart: string, direction: -1 | 1) {
  const candidateStart = shiftWeek(weekStart, direction);
  const candidateEnd = addCalendarDays(candidateStart, WORK_DAYS_IN_WEEK - 1);
  const startsAt = cohort.startsAt.slice(0, 10);
  const endsAt = cohort.endsAt.slice(0, 10);

  return candidateStart <= endsAt && candidateEnd >= startsAt;
}

export function isDateWithinCohort(cohort: Cohort, date: string) {
  return date >= cohort.startsAt.slice(0, 10) && date <= cohort.endsAt.slice(0, 10);
}

export function formatTaskDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseDateOnly(value));
}

export function formatWeekRange(weekStart: string) {
  const weekEnd = addCalendarDays(weekStart, WORK_DAYS_IN_WEEK - 1);
  const formatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(parseDateOnly(weekStart))} — ${formatter.format(parseDateOnly(weekEnd))}`;
}
