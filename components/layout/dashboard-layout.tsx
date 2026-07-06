import Header from "./header";
import Sidebar from "./sidebar";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-8 bg-slate-100 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}