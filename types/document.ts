export type Document = {
  id: number;

  userId: number;

  userName: string;

  type: string;

  fileName: string;

  status: "created" | "signed" | "issued";

  createdAt: string;
};