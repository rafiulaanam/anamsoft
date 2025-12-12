import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminShellWithPath } from "@/components/admin/admin-shell-with-path";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminShellWithPath>{children}</AdminShellWithPath>
  );
}
