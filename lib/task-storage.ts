import { tasks as mockTasks } from "@/mock/tasks";

import type { Task } from "@/types/task";

export function getTasks(): Task[] {
  if (typeof window === "undefined") {
    return mockTasks;
  }

  const storedTasks =
    localStorage.getItem("tasks");

  if (storedTasks) {
    return JSON.parse(storedTasks);
  }

  localStorage.setItem(
    "tasks",
    JSON.stringify(mockTasks)
  );

  return mockTasks;
}

export function saveTasks(
  tasks: Task[]
) {
  localStorage.setItem(
    "tasks",
    JSON.stringify(tasks)
  );
}