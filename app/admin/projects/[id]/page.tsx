import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { computeProjectHealth } from "@/lib/project-health";
import { ProjectHeader } from "../_components/project-header";
import { ProjectOverview } from "../_components/project-overview";
import { RequirementsPanel } from "../_components/requirements-panel";
import { MilestonesPanel } from "../_components/milestones-panel";
import { FilesPanel } from "../_components/files-panel";
import { DeploymentsPanel } from "../_components/deployments-panel";
import { ActivityTimeline } from "../_components/activity-timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      requirements: { orderBy: { sortOrder: "asc" } },
      milestones: { orderBy: { sortOrder: "asc" } },
      files: true,
      deployments: { orderBy: { deployedAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });

  if (!project) notFound();

  const totalReq = project.requirements.length;
  const doneReq = project.requirements.filter((r) => r.isDone).length;
  const reqPct = totalReq === 0 ? 0 : Math.round((doneReq / totalReq) * 100);
  const overdueMilestones = project.milestones.filter(
    (m) => m.dueDate && m.status !== "DONE" && m.dueDate < new Date()
  ).length;

  const health = computeProjectHealth({
    status: project.status,
    startDate: project.startDate,
    deadline: project.deadline,
    reqDonePct: reqPct,
    blockedTasksCount: 0,
    overdueMilestonesCount: overdueMilestones,
    lastActivityAt: project.updatedAt,
  });

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} health={health} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap">
          {["overview", "requirements", "milestones", "files", "deployments", "activity"].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProjectOverview project={project} health={health} reqPct={reqPct} />
        </TabsContent>

        <TabsContent value="requirements">
          <RequirementsPanel projectId={project.id} requirements={project.requirements} />
        </TabsContent>

        <TabsContent value="milestones">
          <MilestonesPanel projectId={project.id} milestones={project.milestones} />
        </TabsContent>

        <TabsContent value="files">
          <FilesPanel projectId={project.id} files={project.files} />
        </TabsContent>

        <TabsContent value="deployments">
          <DeploymentsPanel projectId={project.id} deployments={project.deployments} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTimeline activities={project.activities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
