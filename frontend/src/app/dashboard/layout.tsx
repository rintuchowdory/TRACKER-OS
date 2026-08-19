import { Sidebar } from "@/components/Sidebar";
import { AssistantFab } from "@/components/AssistantFab";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
      <AssistantFab />
    </div>
  );
}
