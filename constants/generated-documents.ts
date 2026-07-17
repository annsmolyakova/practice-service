import type { DocumentKind } from "@/types/api";

export type GeneratedDocumentDefinition = {
  kind: DocumentKind;
  title: string;
  readinessKey:
    | "individualAssignmentReady"
    | "supervisorReviewReady"
    | "reportTitlePageReady";
};

export const generatedDocuments: GeneratedDocumentDefinition[] = [
  {
    kind: "individual-assignment",
    title: "Индивидуальное задание",
    readinessKey: "individualAssignmentReady",
  },
  {
    kind: "supervisor-review",
    title: "Отзыв руководителя",
    readinessKey: "supervisorReviewReady",
  },
  {
    kind: "report-title-page",
    title: "Титульный лист отчёта",
    readinessKey: "reportTitlePageReady",
  },
];
