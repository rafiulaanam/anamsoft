import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ClientAdminLayout } from "@/components/admin/client-admin-layout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <ClientAdminLayout>{children}</ClientAdminLayout>
  );
}
