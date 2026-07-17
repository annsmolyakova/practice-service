export type UserRole = "admin" | "student";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type PracticeProfile = {
  id: string;
  userId: string;
  fullName: string | null;
  specialty: string | null;
  educationProgram: string | null;
  group: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdatePracticeProfileInput = Pick<
  PracticeProfile,
  "fullName" | "specialty" | "educationProgram" | "group"
>;

export type Cohort = {
  id: string;
  title: string;
  description: string | null;
  publicSlug: string;
  startsAt: string;
  endsAt: string;
  applicationStartsAt: string;
  applicationEndsAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CohortFormFieldOption = {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CohortFormField = {
  id: string;
  cohortId: string;
  key: string;
  label: string;
  type: "text" | "select";
  isRequired: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  options: CohortFormFieldOption[];
};

export type CohortFormFieldInput = Pick<
  CohortFormField,
  "key" | "label" | "type" | "isRequired" | "sortOrder"
> & {
  options: Array<Pick<CohortFormFieldOption, "label" | "value" | "sortOrder">>;
};

export type PublicCohort = Omit<Cohort, "publicSlug" | "isActive" | "createdAt" | "updatedAt"> & {
  isApplicationOpen: boolean;
  form: {
    fields: CohortFormField[];
  };
};

export type CohortTrack = {
  id: string;
  cohortId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationAnswer = {
  id: string;
  applicationId: string;
  fieldId: string;
  optionId: string | null;
  value: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationAnswerInput = {
  fieldId: string;
  value?: string;
  optionId?: string;
};

export type PracticeApplication = {
  id: string;
  userId: string;
  cohortId: string;
  trackId: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionComment: string | null;
  createdAt: string;
  updatedAt: string;
  cohort: Cohort;
  track: CohortTrack | null;
  user?: User;
  answers: ApplicationAnswer[];
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type CreateCohortInput = {
  title: string;
  description?: string;
  publicSlug: string;
  startsAt: string;
  endsAt: string;
  applicationStartsAt: string;
  applicationEndsAt: string;
  isActive?: boolean;
};

export type UpdateCohortInput = Partial<Omit<CreateCohortInput, "description">> & {
  description?: string | null;
};
