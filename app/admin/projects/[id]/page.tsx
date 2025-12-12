import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminProjectUpdatesPanel } from "@/components/admin/admin-project-updates-panel";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Project | Admin | AnamSoft",
};

export default async function AdminProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      tasks: { orderBy: { order: "asc" } },
      updates: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <Badge variant="outline">{project.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Client: {project.client?.email} {project.type ? `• ${project.type}` : ""}
        </p>
      </div>

      <AdminProjectUpdatesPanel projectId={project.id} initialUpdates={project.updates} />
    </div>
  );
}
