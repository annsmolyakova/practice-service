import { Task } from "@/types/task";

export const tasks: Task[] = [
  {
    id: 1,
    title: "Создать страницу авторизации",
    description:
      "Реализовать форму входа в систему",

    role: "Frontend Developer",

    status: "todo",
  },

  {
    id: 2,
    title: "Создать API авторизации",
    description:
      "Разработать endpoint для входа",

    role: "Backend Developer",

    status: "todo",
  },

  {
    id: 3,
    title: "Протестировать регистрацию",
    description:
      "Проверить валидацию формы",

    role: "QA Engineer",

    status: "todo",
  },
];