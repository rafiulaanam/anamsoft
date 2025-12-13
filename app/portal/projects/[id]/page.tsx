import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { PortalProjectUpdates } from "@/components/portal/portal-project-updates";
import { PortalProjectChecklist } from "@/components/portal/portal-project-checklist";


export default async function PortalProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { id: params.id, clientId: session.user.id },
    include: {
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
        <p className="text-sm text-muted-foreground">{project.type || "Website project"}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.5fr,1fr]">
        <PortalProjectUpdates updates={project.updates} />
        <PortalProjectChecklist projectId={project.id} tasks={project.tasks} />
      </div>
    </div>
  );
}
