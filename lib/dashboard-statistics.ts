import {
  applicationsApi,
  cohortsApi,
  documentsApi,
  reportsApi,
  tasksApi,
} from "@/lib/practice-api";
import {
  addCalendarDays,
  formatDateOnlyValue,
  getMonday,
} from "@/lib/practice-task-calendar";
import type { Cohort, CohortDocumentSummaryItem, PracticeApplication } from "@/types/api";

const COHORT_PAGE_SIZE = 100;
const WORK_WEEK_LENGTH = 5;

export type AdminDashboardStats = {
  cohorts: number;
  applications: number;
  documents: number;
  tasks: number;
};

export type StudentDashboardStats = {
  applications: number;
  documents: number;
  tasks: number;
};

type CohortCollection = {
  items: Cohort[];
  total: number;
};

async function getAllCohorts(): Promise<CohortCollection> {
  const firstPage = await cohortsApi.list(1, COHORT_PAGE_SIZE);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, firstPage.pagination.pages - 1) }, (_, index) =>
      cohortsApi.list(index + 2, COHORT_PAGE_SIZE),
    ),
  );

  return {
    items: [firstPage, ...remainingPages].flatMap((response) => response.items),
    total: firstPage.pagination.total,
  };
}

function getCurrentWeek(now: Date) {
  const startsAt = getMonday(formatDateOnlyValue(now));

  return {
    startsAt,
    endsAt: addCalendarDays(startsAt, WORK_WEEK_LENGTH - 1),
  };
}

function isCohortAvailableDuringWeek(
  cohort: Cohort,
  week: ReturnType<typeof getCurrentWeek>,
) {
  return cohort.startsAt.slice(0, 10) <= week.endsAt && cohort.endsAt.slice(0, 10) >= week.startsAt;
}

function countReadyDocuments(item: CohortDocumentSummaryItem) {
  return [
    item.individualAssignmentReady,
    item.supervisorReviewReady,
    item.practiceReportUploaded,
    item.reportTitlePageReady,
  ].filter(Boolean).length;
}

function getUniqueApprovedCohorts(applications: PracticeApplication[]) {
  const cohorts = new Map<string, Cohort>();

  for (const application of applications) {
    if (application.status === "approved" && !cohorts.has(application.cohortId)) {
      cohorts.set(application.cohortId, application.cohort);
    }
  }

  return [...cohorts.values()];
}

export async function getAdminDashboardStats(
  now = new Date(),
): Promise<AdminDashboardStats> {
  const cohorts = await getAllCohorts();
  const currentWeek = getCurrentWeek(now);
  const availableCohorts = cohorts.items.filter((cohort) =>
    isCohortAvailableDuringWeek(cohort, currentWeek),
  );
  const [applicationResponses, documentResponses, taskResponses] = await Promise.all([
    Promise.all(cohorts.items.map((cohort) => applicationsApi.listByCohort(cohort.id))),
    Promise.all(cohorts.items.map((cohort) => documentsApi.getCohortSummary(cohort.id))),
    Promise.all(
      availableCohorts.map((cohort) => tasksApi.listCohortWeek(cohort.id, currentWeek.startsAt)),
    ),
  ]);

  return {
    cohorts: cohorts.total,
    applications: applicationResponses.reduce((total, response) => total + response.items.length, 0),
    documents: documentResponses.reduce(
      (total, response) =>
        total + response.items.reduce((subtotal, item) => subtotal + countReadyDocuments(item), 0),
      0,
    ),
    tasks: taskResponses.reduce(
      (total, response) =>
        total + response.items.reduce((subtotal, participant) => subtotal + participant.tasks.length, 0),
      0,
    ),
  };
}

export async function getStudentDashboardStats(
  now = new Date(),
): Promise<StudentDashboardStats> {
  const applicationResponse = await applicationsApi.listMine();
  const approvedApplications = applicationResponse.items.filter(
    (application) => application.status === "approved",
  );
  const currentWeek = getCurrentWeek(now);
  const availableCohorts = getUniqueApprovedCohorts(applicationResponse.items).filter((cohort) =>
    isCohortAvailableDuringWeek(cohort, currentWeek),
  );
  const [reportResponses, taskResponses] = await Promise.all([
    Promise.all(
      approvedApplications.map((application) => reportsApi.getByApplication(application.id)),
    ),
    Promise.all(
      availableCohorts.map((cohort) => tasksApi.listMineByWeek(cohort.id, currentWeek.startsAt)),
    ),
  ]);

  return {
    applications: applicationResponse.items.length,
    documents: reportResponses.filter((response) => response.report !== null).length,
    tasks: taskResponses.reduce((total, response) => total + response.items.length, 0),
  };
}
