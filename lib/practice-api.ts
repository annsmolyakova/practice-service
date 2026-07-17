import { apiRequest } from "@/lib/api-client";
import type {
  ApplicationAnswerInput,
  AuthSession,
  Cohort,
  CohortFormField,
  CohortFormFieldInput,
  CohortTrack,
  CreateCohortInput,
  Pagination,
  PracticeApplication,
  PracticeProfile,
  PublicCohort,
  UpdateCohortInput,
  UpdatePracticeProfileInput,
} from "@/types/api";

export const authApi = {
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
};
