import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminShellWithPath } from "@/components/admin/admin-shell-with-path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (isBuild) {
    return <div>{children}</div>;
  }
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminShellWithPath>{children}</AdminShellWithPath>
  );
}
