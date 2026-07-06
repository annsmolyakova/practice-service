import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminPage() {
  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-8">
        Панель администратора
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <Card>
          <CardHeader>
            <CardTitle>Когорты</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">4</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Заявки</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">18</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Документы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">27</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Задачи</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">9</p>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}