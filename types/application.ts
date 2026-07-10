export type Application = {
  id: number;
  userId: number;
  cohortId: number;

  fullName: string;
  group: string;
  course: string;

  desiredRole: string;
  stack: string;

  status: string;
  reviewComment: string;

  assignedRole?: string;
};