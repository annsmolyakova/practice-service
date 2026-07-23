const API_ERROR_MESSAGES: Record<string, string> = {
  "Answer field does not belong to cohort form": "Поле ответа не относится к форме потока",
  "Application already exists": "Заявка уже существует",
  "Application must be approved": "Заявка должна быть одобрена",
  "Application not found": "Заявка не найдена",
  "Application period is closed": "Приём заявок закрыт",
  "Application track is required": "Для заявки необходимо назначить трек",
  "Approved application is required": "Необходима одобренная заявка",
  "Assignment not found": "Тестовое задание не найдено",
  "Authentication is required": "Требуется авторизация",
  "Authorization header is required": "Требуется авторизация",
  "Authorization header must use Bearer token": "Некорректный формат авторизации",
  "Cohort not found": "Поток практики не найден",
  "Cohort public slug already exists": "Публичная ссылка потока уже используется",
  Forbidden: "Недостаточно прав для выполнения действия",
  "Invalid authorization token": "Сессия недействительна. Войдите снова",
  "Invalid email or password": "Неверная почта или пароль",
  "Invalid refresh token": "Сессия недействительна. Войдите снова",
  "Only PDF and DOCX reports are allowed": "Можно загрузить только отчёт PDF или DOCX",
  "Only pending application can be updated": "Можно изменить только заявку на рассмотрении",
  "Practice profile is required": "Заполните профиль практики",
  "Practice report is required": "Сначала загрузите отчёт по практике",
  "Practice report must be approved": "Отчёт по практике должен быть одобрен",
  "Practice report not found": "Отчёт по практике не найден",
  "Practice review activities is required": "В отзыве не заполнено описание деятельности",
  "Practice review characteristic is required": "В отзыве не заполнена характеристика",
  "Practice review employment offer status is required":
    "В отзыве не указан статус предложения работы",
  "Practice review employment status is required": "В отзыве не указан статус трудоустройства",
  "Practice review grade is required": "В отзыве не указана оценка",
  "Practice review is required": "Сначала заполните отзыв руководителя",
  "Practice review must be ready": "Отзыв руководителя ещё не готов",
  "Practice review next practice offer status is required":
    "В отзыве не указан статус приглашения на следующую практику",
  "Practice review suggestions is required": "В отзыве не заполнены предложения",
  "Profile educationProgram is required": "Укажите образовательную программу в профиле",
  "Profile directionCode is required": "Укажите код направления в профиле",
  "Profile directionName is required": "Укажите наименование направления в профиле",
  "Profile fullName is required": "Укажите ФИО в профиле",
  "Profile fullNameGenitive is required":
    "Укажите ФИО в родительном падеже в профиле",
  "Profile group is required": "Укажите группу в профиле",
  "Profile mainStageWorkList is required":
    "Укажите перечень работ основного этапа в профиле",
  "Profile urfuPracticeSupervisor is required":
    "Укажите ФИО руководителя практики от УрФУ в профиле",
  "Refresh token expired": "Сессия истекла. Войдите снова",
  "Report file is required": "Выберите файл отчёта",
  "Required form field is missing": "Заполните обязательное поле формы",
  "Route not found": "Запрашиваемый адрес не найден",
  "Select answer must contain optionId only": "Выберите один из предложенных вариантов",
  "Selected option does not belong to field": "Выбранный вариант не относится к полю",
  "Task already exists for this date": "На эту дату задача уже существует",
  "Task date must be a weekday": "Дата задачи должна приходиться на рабочий день",
  "Task date must be within practice period": "Дата задачи должна входить в период практики",
  "Task not found": "Задача не найдена",
  "Text answer must contain value only": "Введите текстовый ответ",
  "Track not found": "Трек не найден",
  "Track title already exists in cohort": "Трек с таким названием уже существует в потоке",
  "User not found": "Пользователь не найден",
  "User with this email already exists": "Пользователь с такой почтой уже существует",
  "Validation error": "Проверьте правильность заполненных данных",
  "weekStart must be a Monday": "Начало недели должно приходиться на понедельник",
};

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: "Проверьте правильность данных",
  401: "Требуется авторизация",
  403: "Недостаточно прав для выполнения действия",
  404: "Запрашиваемые данные не найдены",
  409: "Данные конфликтуют с уже существующими",
  413: "Файл слишком большой",
  500: "Внутренняя ошибка сервера",
};

export function getApiErrorMessage(message: string | undefined, status: number) {
  if (message && API_ERROR_MESSAGES[message]) {
    return API_ERROR_MESSAGES[message];
  }

  return STATUS_ERROR_MESSAGES[status] ?? "Не удалось выполнить запрос";
}
