import { documents as mockDocuments } from "@/mock/documents";

import type { Document } from "@/types/document";

export function getDocuments(): Document[] {
  if (typeof window === "undefined") {
    return mockDocuments;
  }

  const storedDocuments =
    localStorage.getItem("documents");

  if (storedDocuments) {
    return JSON.parse(storedDocuments);
  }

  localStorage.setItem(
    "documents",
    JSON.stringify(mockDocuments)
  );

  return mockDocuments;
}

export function saveDocuments(
  documents: Document[]
) {
  localStorage.setItem(
    "documents",
    JSON.stringify(documents)
  );
}