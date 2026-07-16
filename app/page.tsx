import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-6">
      <div className="max-w-4xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-14 text-center">

        <div className="mb-10">

          <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Сервис организации практики
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Платформа для управления практикой студентов:
            заявки, документы, задачи и сопровождение
            учебного процесса в одном месте.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="
              px-8 py-4
              rounded-2xl
              bg-blue-600
              text-white
              font-medium
              shadow-lg
              hover:bg-blue-700
              hover:scale-105
              transition-all
            "
          >
            Войти
          </Link>

          <Link
            href="/register"
            className="
              px-8 py-4
              rounded-2xl
              bg-white
              border
              border-slate-300
              text-slate-700
              font-medium
              hover:bg-slate-50
              hover:scale-105
              transition-all
            "
          >
            Регистрация
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          <div className="p-6 rounded-2xl bg-slate-50">
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-semibold mb-2">
              Заявки
            </h3>
            <p className="text-sm text-slate-500">
              Подача и обработка заявок на практику.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50">
            <div className="text-3xl mb-2">📄</div>
            <h3 className="font-semibold mb-2">
              Документы
            </h3>
            <p className="text-sm text-slate-500">
              Генерация и хранение документов практики.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold mb-2">
              Задачи
            </h3>
            <p className="text-sm text-slate-500">
              Распределение и контроль выполнения задач.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}