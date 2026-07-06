import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-10 text-center">

        <h1 className="text-4xl font-bold mb-4">
          Сервис организации практики
        </h1>

        <p className="text-slate-600 mb-8">
          Веб-приложение для организации и сопровождения учебной практики студентов.
        </p>

        <div className="flex justify-center gap-4">

          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Войти
          </Link>

          <Link
            href="/register"
            className="px-6 py-3 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
          >
            Регистрация
          </Link>

        </div>

      </div>
    </main>
  );
}
