import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminShellWithPath } from "@/components/admin/admin-shell-with-path";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/login");
  }

  const [leadsCount, unreadLeadsCount] = await Promise.all([
    prisma.lead.count().catch(() => 0),
    prisma.lead.count({ where: { unread: true } }).catch(() => 0),
  ]);

  return (
    <AdminShellWithPath leadsCount={leadsCount} unreadLeadsCount={unreadLeadsCount}>
      {children}
    </AdminShellWithPath>
  );
}
