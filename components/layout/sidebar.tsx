import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">

      <h2 className="text-2xl font-bold mb-8">
        Практика
      </h2>

      <nav className="space-y-2">

        <Link href="/" className="block rounded-lg px-4 py-2 hover:bg-slate-700">
            Главная
        </Link>

        <Link href="/admin/cohorts" className="block rounded-lg px-4 py-2 hover:bg-slate-700">
            Когорты
        </Link>

        <Link href="/admin/applications" className="block rounded-lg px-4 py-2 hover:bg-slate-700">
            Заявки
        </Link>

        <Link href="/admin/documents" className="block rounded-lg px-4 py-2 hover:bg-slate-700">
            Документы
        </Link>

        <Link href="/admin/tasks" className="block rounded-lg px-4 py-2 hover:bg-slate-700">
            Задачи
        </Link>

        <hr className="border-slate-700 my-4" />

        <Link href="/student" className="block rounded-lg px-4 py-2 hover:bg-slate-700">
            Кабинет студента
        </Link>

        </nav>

    </aside>
  );
}