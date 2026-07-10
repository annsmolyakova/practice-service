import { applications as mockApplications } from "@/mock/applications";
import { Application } from "@/types/application";

export function getApplications(): Application[] {
  if (typeof window === "undefined") {
    return mockApplications;
  }

  const storedApplications =
    localStorage.getItem("applications");

  if (storedApplications) {
    return JSON.parse(
      storedApplications
    ) as Application[];
  }

  localStorage.setItem(
    "applications",
    JSON.stringify(mockApplications)
  );

  return mockApplications;
}

export function saveApplications(
  applications: Application[]
): void {
  localStorage.setItem(
    "applications",
    JSON.stringify(applications)
  );
}