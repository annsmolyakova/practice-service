import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StudentPage() {
  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-8">
        Личный кабинет студента
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Мои заявки</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">1</p>
            <p className="text-sm text-slate-500 mt-2">
              Поданная заявка на практику
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Документы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">3</p>
            <p className="text-sm text-slate-500 mt-2">
              Загруженные документы
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Задачи</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">2</p>
            <p className="text-sm text-slate-500 mt-2">
              Активные задачи
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Заголовок</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Здесь будут отображаться заявки на практику, документы,
            задачи и уведомления. После реализации авторизации информация
            будет загружаться для каждого пользователя индивидуально.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}