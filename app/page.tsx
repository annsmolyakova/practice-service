import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-4xl rounded-3xl border border-white/50 bg-white/80 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-10 md:p-14">

        {/* Заголовок и описание */}
        <div className="mb-8 sm:mb-10">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:mb-6 sm:text-4xl md:text-5xl">
            Сервис организации практики
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg md:text-xl">
            Платформа для управления практикой студентов:
            заявки, документы, задачи и сопровождение
            учебного процесса в одном месте.
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/login"
            className="
              rounded-2xl
              bg-blue-600
              px-8 py-3.5
              text-center
              font-medium
              text-white
              shadow-lg
              transition-all
              hover:bg-blue-700
              hover:scale-105
              sm:py-4
            "
          >
            Войти
          </Link>

          <Link
            href="/register"
            className="
              rounded-2xl
              border
              border-slate-300
              bg-white
              px-8 py-3.5
              text-center
              font-medium
              text-slate-700
              transition-all
              hover:bg-slate-50
              hover:scale-105
              sm:py-4
            "
          >
            Регистрация
          </Link>
        </div>

        {/* Возможности сервиса */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:gap-6 md:grid-cols-3">

          {/* Заявки */}
          <div className="rounded-2xl bg-slate-50 p-5 transition-all hover:-translate-y-1 hover:shadow-md sm:p-6">
            <div className="mb-2 text-3xl">📋</div>

            <h3 className="mb-2 font-semibold text-slate-900">
              Заявки
            </h3>

            <p className="text-sm leading-relaxed text-slate-500">
              Подача и обработка заявок на практику.
            </p>
          </div>

          {/* Документы */}
          <div className="rounded-2xl bg-slate-50 p-5 transition-all hover:-translate-y-1 hover:shadow-md sm:p-6">
            <div className="mb-2 text-3xl">📄</div>

            <h3 className="mb-2 font-semibold text-slate-900">
              Документы
            </h3>

            <p className="text-sm leading-relaxed text-slate-500">
              Генерация и хранение документов практики.
            </p>
          </div>

          {/* Задачи */}
          <div className="rounded-2xl bg-slate-50 p-5 transition-all hover:-translate-y-1 hover:shadow-md sm:p-6">
            <div className="mb-2 text-3xl">✅</div>

            <h3 className="mb-2 font-semibold text-slate-900">
              Задачи
            </h3>

            <p className="text-sm leading-relaxed text-slate-500">
              Распределение и контроль выполнения задач.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}