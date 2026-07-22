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
  fullNameGenitive: string | null;
  directionCode: string | null;
  directionName: string | null;
  educationProgram: string | null;
  group: string | null;
  urfuPracticeSupervisor: string | null;
  urfuPracticeSupervisorShortName: string | null;
  mainStageWorkList: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdatePracticeProfileInput = Pick<
  PracticeProfile,
  | "fullName"
  | "fullNameGenitive"
  | "directionCode"
  | "directionName"
  | "educationProgram"
  | "group"
  | "urfuPracticeSupervisor"
  | "urfuPracticeSupervisorShortName"
  | "mainStageWorkList"
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
  isPubliclyListed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CohortAssignment = {
  id: string;
  cohortId: string;
  title: string;
  description: string | null;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpsertCohortAssignmentInput = Pick<
  CohortAssignment,
  "title" | "description" | "content" | "isPublished"
>;

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

export type CreateCohortTrackInput = {
  title: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateCohortTrackInput = Partial<
  Pick<CohortTrack, "title" | "description" | "sortOrder" | "isActive">
>;

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

export type UpdatePracticeApplicationInput = {
  answers: ApplicationAnswerInput[];
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

export type DocumentKind =
  | "individual-assignment"
  | "supervisor-review"
  | "report-title-page";

export type CohortDocumentSummaryItem = {
  applicationId: string;
  userId: string;
  fullName: string | null;
  individualAssignmentReady: boolean;
  supervisorReviewReady: boolean;
  practiceReportUploaded: boolean;
  practiceReportApproved: boolean;
  reportTitlePageReady: boolean;
};

export type PracticeReport = {
  id: string;
  applicationId: string;
  originalName: string;
  mimeType: string;
  size: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PracticeReview = {
  id: string;
  applicationId: string;
  activities: string | null;
  characteristic: string | null;
  isEmployed: boolean | null;
  employmentPosition: string | null;
  isNextPracticeOffered: boolean | null;
  isEmploymentOffered: boolean | null;
  suggestions: string | null;
  grade: string | null;
  isReady: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpsertPracticeReviewInput = Pick<
  PracticeReview,
  | "activities"
  | "characteristic"
  | "isEmployed"
  | "employmentPosition"
  | "isNextPracticeOffered"
  | "isEmploymentOffered"
  | "suggestions"
  | "grade"
  | "isReady"
>;

export type PracticeTask = {
  id: string;
  userId: string;
  cohortId: string;
  date: string;
  title: string;
  description: string;
  artifactLink: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskParticipant = {
  userId: string;
  fullName: string | null;
  track: Pick<CohortTrack, "id" | "title"> | null;
  tasks: PracticeTask[];
};

export type CreatePracticeTaskInput = Pick<
  PracticeTask,
  "date" | "title" | "description"
> & {
  artifactLink?: string | null;
};

export type UpdatePracticeTaskInput = Partial<
  Pick<PracticeTask, "title" | "description" | "artifactLink">
>;

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
  isPubliclyListed?: boolean;
};

export type UpdateCohortInput = Partial<Omit<CreateCohortInput, "description">> & {
  description?: string | null;
};
