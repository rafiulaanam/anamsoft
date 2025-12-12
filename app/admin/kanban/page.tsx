import type { Metadata } from "next";
import type { LeadStatus, ProjectEstimate, WebsiteAudit } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AdminLeadsKanbanBoard, type KanbanLead } from "@/components/admin/admin-leads-kanban-board";

export const metadata: Metadata = {
  title: "Leads Kanban | Admin | AnamSoft",
};

type LeadSourceType = "ESTIMATE" | "AUDIT";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminKanbanPage() {
  // During static build or if DB is unreachable, return an empty board to avoid Prisma connection errors.
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads Kanban</h1>
          <p className="text-sm text-muted-foreground">Visual pipeline for all leads.</p>
        </div>
        <AdminLeadsKanbanBoard leads={[]} />
      </div>
    );
  }

  const estimates: ProjectEstimate[] = (prisma as any).projectEstimate
    ? await prisma.projectEstimate.findMany({ orderBy: { createdAt: "desc" } })
    : [];
  const audits: WebsiteAudit[] = (prisma as any).websiteAudit
    ? await prisma.websiteAudit.findMany({ orderBy: { createdAt: "desc" } })
    : [];

  const mappedEstimates: KanbanLead[] = estimates.map((estimate) => ({
    id: estimate.id,
    sourceType: "ESTIMATE" as LeadSourceType,
    status: estimate.status as LeadStatus,
    name: estimate.name,
    email: estimate.email,
    salonName: estimate.salonName,
    websiteUrl: estimate.websiteUrl ?? undefined,
    businessType: estimate.businessType,
    mainLabel: estimate.salonName ? `Estimate – ${estimate.salonName}` : `Estimate – ${estimate.businessType}`,
    subLabel: `Budget: ${estimate.budgetRange} · Timeline: ${estimate.timeline}`,
    createdAt: estimate.createdAt,
  }));

  const mappedAudits: KanbanLead[] = audits.map((audit) => ({
    id: audit.id,
    sourceType: "AUDIT" as LeadSourceType,
    status: audit.status as LeadStatus,
    name: audit.name,
    email: audit.email,
    salonName: undefined,
    websiteUrl: audit.websiteUrl,
    businessType: audit.businessType ?? undefined,
    mainLabel: audit.businessType ? `Audit – ${audit.businessType}` : "Audit – Website review",
    subLabel: `Main goal: ${audit.mainGoal}`,
    createdAt: audit.createdAt,
  }));

  const leads: KanbanLead[] = [...mappedEstimates, ...mappedAudits];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads Kanban</h1>
        <p className="text-sm text-muted-foreground">
          Visual pipeline for all leads from project estimates and website audit requests.
        </p>
      </div>

      <AdminLeadsKanbanBoard leads={leads} />
    </div>
  );
}
