export type Task = {
  id: number;

  title: string;
  description: string;

  role: string;

  assignedUserId?: number;
  assignedUserName?: string;

  status: "todo" | "in_progress" | "done";
};