import { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeProjectHealth } from "@/lib/project-health";
import { ProjectsFilters } from "./_components/projects-filters";
import { ProjectsTable } from "./_components/projects-table";
import { parseProjectSearchParams, buildProjectWhereClause, buildProjectOrderBy } from "./_lib/query";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ProjectsListPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const parsed = parseProjectSearchParams(searchParams);
  const projectFields =
    ((prisma as any)?._dmmf?.modelMap?.Project?.fields as { name: string }[] | undefined)?.map((f) => f.name) ?? [];
  // Default to true when model metadata isn't available to avoid dropping filters.
  const supportsDeleted = projectFields.length === 0 ? true : projectFields.includes("deletedAt");
  const supportsArchived = projectFields.length === 0 ? true : projectFields.includes("archivedAt");

  const effectiveView = supportsArchived ? parsed.view : parsed.view === "archived" ? "active" : parsed.view;
  const view = effectiveView;
  const adjusted = { ...parsed, view: effectiveView };

  const where = buildProjectWhereClause(adjusted, { deleted: supportsDeleted, archived: supportsArchived });
  const orderBy = buildProjectOrderBy(adjusted);

  const activeWhere: Prisma.ProjectWhereInput = {
    ...(supportsDeleted ? { deletedAt: null } : {}),
    ...(supportsArchived ? { archivedAt: null } : {}),
  };
  const trashWhere: Prisma.ProjectWhereInput | undefined = supportsDeleted ? { deletedAt: { not: null } } : undefined;
  const archivedWhere: Prisma.ProjectWhereInput | undefined = supportsArchived
    ? { ...(supportsDeleted ? { deletedAt: null } : {}), archivedAt: { not: null } }
    : undefined;

  const now = new Date();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const atRiskWhere: Prisma.ProjectWhereInput = {
    ...(supportsDeleted ? { deletedAt: null } : {}),
    ...(supportsArchived ? { archivedAt: null } : {}),
    OR: [
      { deadline: { lt: now } },
      { deadline: { gte: now, lte: nextWeek } },
    ],
  };

  const [total, projects, trashCount, activeCount, archivedCount, atRiskCount] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy,
      skip: (parsed.page - 1) * parsed.pageSize,
      take: parsed.pageSize,
      select: {
        id: true,
        name: true,
        clientName: true,
        status: true,
        deadline: true,
        startDate: true,
        updatedAt: true,
        ...(supportsDeleted ? { deletedAt: true } : {}),
        ...(supportsArchived ? { archivedAt: true, isArchived: true } : {}),
      } as const,
    }),
    trashWhere ? prisma.project.count({ where: trashWhere }) : Promise.resolve(0),
    prisma.project.count({ where: activeWhere }),
    archivedWhere ? prisma.project.count({ where: archivedWhere }) : Promise.resolve(0),
    prisma.project.count({ where: atRiskWhere }),
  ]);

  // requirements progress per project
  const projectIds = projects.map((p) => p.id);
  let totalMap = new Map<string, number>();
  let doneMap = new Map<string, number>();
  if (projectIds.length > 0) {
    const [reqTotals, reqDone] = await Promise.all([
      prisma.projectRequirement.groupBy({ by: ["projectId"], _count: { _all: true }, where: { projectId: { in: projectIds } } }),
      prisma.projectRequirement.groupBy({ by: ["projectId"], _count: { _all: true }, where: { projectId: { in: projectIds }, isDone: true } }),
    ]);
    totalMap = new Map(reqTotals.map((r) => [r.projectId, r._count._all]));
    doneMap = new Map(reqDone.map((r) => [r.projectId, r._count._all]));
  }

  const rows = projects.map((p) => {
    const totalReq = totalMap.get(p.id) ?? 0;
    const doneReq = doneMap.get(p.id) ?? 0;
    const reqPct = totalReq === 0 ? 0 : Math.round((doneReq / totalReq) * 100);
    const overdueMilestones = 0;
    const healthInfo = computeProjectHealth({
      status: p.status,
      startDate: (p as any).startDate ?? null,
      deadline: (p as any).deadline ?? null,
      reqDonePct: reqPct,
      blockedTasksCount: 0,
      overdueMilestonesCount: overdueMilestones,
      lastActivityAt: (p as any).updatedAt,
      scopeGrowthPctLast7d: 0,
    });
    const deadlineLabel = (p as any).deadline ? formatDeadline((p as any).deadline, now) : "No deadline";
    const archivedFlag = supportsArchived ? !!((p as any).isArchived ?? (p as any).archivedAt) : false;
    const deletedFlag = supportsDeleted ? !!(p as any).deletedAt : false;
    const healthLabel =
      healthInfo.health === "OVERDUE" ? "Overdue" : healthInfo.health === "AT_RISK" ? "At risk" : "On track";

    return {
      id: p.id,
      name: p.name,
      clientName: p.clientName ?? "",
      status: p.status,
      health: healthLabel,
      healthHint: healthInfo.reasons[0] ?? "",
      deadline: (p as any).deadline ? (p as any).deadline.toISOString?.() ?? null : null,
      deadlineLabel,
      reqPct,
      updatedAt: p.updatedAt.toISOString(),
      archived: archivedFlag,
      deleted: deletedFlag,
    };
  });

  const kpis = computeKpis(rows, { trashCount, activeCount, archivedCount, atRiskCount });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">Main workspace for all projects.</p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">New Project</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active" value={kpis.active} href="/admin/projects?view=active" />
        <KpiCard label="Archived" value={kpis.archived} href="/admin/projects?view=archived" />
        <KpiCard label="Trash" value={kpis.trash} href="/admin/projects?view=trash" />
        <KpiCard label="At Risk" value={kpis.atRisk} href="/admin/projects?view=active&health=at-risk" />
      </div>

      <ProjectsFilters current={adjusted} />

      <ProjectsTable data={rows} total={total} page={parsed.page} pageSize={parsed.pageSize} sort={parsed.sort} view={view} />
    </div>
  );
}

function computeKpis(
  rows: any[],
  counts: { trashCount: number; activeCount: number; archivedCount: number; atRiskCount: number }
) {
  return {
    active: counts.activeCount,
    archived: counts.archivedCount,
    atRisk: rows.filter((r) => r.health === "At risk").length || counts.atRiskCount,
    trash: counts.trashCount,
  };
}

function formatDeadline(deadline: Date, now: Date) {
  const diff = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `Overdue by ${Math.abs(diff)}d`;
  if (diff === 0) return "Due today";
  return `${diff}d left`;
}

function KpiCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="block">
      <Card className="hover:shadow-md transition-shadow border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-2xl font-semibold">{value}</div>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
