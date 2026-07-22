import { apiFileRequest, apiRequest } from "@/lib/api-client";
import type {
  ApplicationAnswerInput,
  AuthSession,
  Cohort,
  CohortAssignment,
  CohortDocumentSummaryItem,
  CohortFormField,
  CohortFormFieldInput,
  CohortTrack,
  CreateCohortTrackInput,
  CreateCohortInput,
  CreatePracticeTaskInput,
  DocumentKind,
  Pagination,
  PracticeApplication,
  PracticeProfile,
  PracticeReport,
  PracticeReview,
  PracticeTask,
  PublicCohort,
  TaskParticipant,
  UpdateCohortInput,
  UpdateCohortTrackInput,
  UpdatePracticeApplicationInput,
  UpdatePracticeProfileInput,
  UpdatePracticeTaskInput,
  UpsertCohortAssignmentInput,
  UpsertPracticeReviewInput,
  User,
} from "@/types/api";

export const authApi = {
  getMe: () => apiRequest<{ user: User }>("/auth/me"),
  login: (email: string, password: string) =>
    apiRequest<AuthSession>("/auth/login", {
      method: "POST",
      authenticated: false,
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string) =>
    apiRequest<AuthSession>("/auth/register", {
      method: "POST",
      authenticated: false,
      body: JSON.stringify({ email, password }),
    }),
  logout: (refreshToken: string) =>
    apiRequest<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
};

export const profilesApi = {
  getMine: () =>
    apiRequest<{ profile: PracticeProfile | null }>("/profiles/me"),
  updateMine: (input: UpdatePracticeProfileInput) =>
    apiRequest<{ profile: PracticeProfile }>("/profiles/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};

export const cohortsApi = {
  list: (page = 1, limit = 20) => {
    const searchParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    return apiRequest<{ items: Cohort[]; pagination: Pagination }>(
      `/cohorts?${searchParams.toString()}`,
    );
  },
  listAvailable: () =>
    apiRequest<{ items: Cohort[] }>("/cohorts/available"),
  get: (id: string) =>
    apiRequest<{ cohort: Cohort }>(`/cohorts/${id}`),
  create: (input: CreateCohortInput) =>
    apiRequest<{ cohort: Cohort }>("/cohorts", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id: string, input: UpdateCohortInput) =>
    apiRequest<{ cohort: Cohort }>(`/cohorts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  getForm: (id: string) =>
    apiRequest<{ fields: CohortFormField[] }>(`/cohorts/${id}/form`),
  replaceForm: (id: string, fields: CohortFormFieldInput[]) =>
    apiRequest<{ fields: CohortFormField[] }>(`/cohorts/${id}/form`, {
      method: "PUT",
      body: JSON.stringify({ fields }),
    }),
  getPublic: (publicSlug: string) =>
    apiRequest<{ cohort: PublicCohort }>(`/cohorts/public/${publicSlug}`, {
      authenticated: false,
    }),
};

export const assignmentsApi = {
  getByCohort: (cohortId: string) =>
    apiRequest<{ assignment: CohortAssignment | null }>(
      `/assignments/cohorts/${cohortId}`,
    ),
  upsertByCohort: (cohortId: string, input: UpsertCohortAssignmentInput) =>
    apiRequest<{ assignment: CohortAssignment }>(`/assignments/cohorts/${cohortId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  getMineByCohort: (cohortId: string) =>
    apiRequest<{ assignment: CohortAssignment }>(
      `/assignments/cohorts/${cohortId}/me`,
    ),
};

export const applicationsApi = {
  listMine: () =>
    apiRequest<{ items: PracticeApplication[] }>("/applications/me"),
  listByCohort: (cohortId: string) =>
    apiRequest<{ items: PracticeApplication[] }>(`/applications/cohorts/${cohortId}`),
  getAutofill: (cohortId: string) =>
    apiRequest<{ answers: ApplicationAnswerInput[] }>(`/applications/autofill/${cohortId}`),
  create: (cohortId: string, answers: ApplicationAnswerInput[]) =>
    apiRequest<{ application: PracticeApplication }>("/applications", {
      method: "POST",
      body: JSON.stringify({ cohortId, answers }),
    }),
  update: (id: string, input: UpdatePracticeApplicationInput) =>
    apiRequest<{ application: PracticeApplication }>(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  updateStatus: (
    id: string,
    input: {
      status: PracticeApplication["status"];
      trackId?: string | null;
      rejectionComment?: string | null;
    },
  ) =>
    apiRequest<{ application: PracticeApplication }>(`/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};

export const tracksApi = {
  listByCohort: (cohortId: string) =>
    apiRequest<{ items: CohortTrack[] }>(`/tracks/cohorts/${cohortId}`),
  create: (cohortId: string, input: CreateCohortTrackInput) =>
    apiRequest<{ track: CohortTrack }>(`/tracks/cohorts/${cohortId}`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id: string, input: UpdateCohortTrackInput) =>
    apiRequest<{ track: CohortTrack }>(`/tracks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};

export const documentsApi = {
  getCohortSummary: (cohortId: string) =>
    apiRequest<{ items: CohortDocumentSummaryItem[] }>(
      `/documents/cohorts/${cohortId}/summary`,
    ),
  download: (applicationId: string, kind: DocumentKind) =>
    apiFileRequest(
      `/documents/applications/${applicationId}/${kind}`,
      `${kind}-${applicationId}.docx`,
  ),
};

export const reportsApi = {
  getByApplication: (applicationId: string) =>
    apiRequest<{ report: PracticeReport | null }>(`/reports/applications/${applicationId}`),
  upload: (applicationId: string, file: File) => {
    const body = new FormData();
    body.set("report", file);

    return apiRequest<{ report: PracticeReport }>(`/reports/applications/${applicationId}`, {
      method: "PUT",
      body,
    });
  },
  download: (applicationId: string, fallbackFileName: string) =>
    apiFileRequest(`/reports/applications/${applicationId}/file`, fallbackFileName),
  updateApproval: (applicationId: string, isApproved: boolean) =>
    apiRequest<{ report: PracticeReport }>(
      `/reports/applications/${applicationId}/approval`,
      {
        method: "PATCH",
        body: JSON.stringify({ isApproved }),
      },
    ),
};

export const reviewsApi = {
  getByApplication: (applicationId: string) =>
    apiRequest<{ review: PracticeReview | null }>(`/reviews/applications/${applicationId}`),
  upsert: (applicationId: string, input: UpsertPracticeReviewInput) =>
    apiRequest<{ review: PracticeReview }>(`/reviews/applications/${applicationId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
};

function getTaskWeekPath(path: string, weekStart: string) {
  const searchParams = new URLSearchParams({ weekStart });

  return `${path}?${searchParams.toString()}`;
}

export const tasksApi = {
  listCohortWeek: (cohortId: string, weekStart: string) =>
    apiRequest<{ items: TaskParticipant[] }>(
      getTaskWeekPath(`/tasks/cohorts/${cohortId}/week`, weekStart),
    ),
  listMineByWeek: (cohortId: string, weekStart: string) =>
    apiRequest<{ items: PracticeTask[] }>(
      getTaskWeekPath(`/tasks/cohorts/${cohortId}/me`, weekStart),
    ),
  createMine: (cohortId: string, input: CreatePracticeTaskInput) =>
    apiRequest<{ task: PracticeTask }>(`/tasks/cohorts/${cohortId}`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateMine: (taskId: string, input: UpdatePracticeTaskInput) =>
    apiRequest<{ task: PracticeTask }>(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteMine: (taskId: string) =>
    apiRequest<void>(`/tasks/${taskId}`, {
      method: "DELETE",
    }),
};
