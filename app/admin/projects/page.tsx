import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AdminProjectsTable } from "@/components/admin/admin-projects-table";

export const metadata: Metadata = {
  title: "Projects | Admin | AnamSoft",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminProjectsPage() {
  // During static build or if DB is unreachable, return an empty list to avoid Prisma errors.
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage client projects, status, and updates.</p>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-3">
          <p className="text-sm text-muted-foreground">Total projects: 0</p>
          <AdminProjectsTable projects={[]} />
        </div>
      </div>
    );
  }

  const projects =
    (prisma as any).project?.findMany
      ? await prisma.project.findMany({
          orderBy: { createdAt: "desc" },
          include: { client: true },
        })
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">Manage client projects, status, and updates.</p>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-sm text-muted-foreground">Total projects: {projects.length}</p>
        <AdminProjectsTable projects={projects} />
      </div>
    </div>
  );
}
