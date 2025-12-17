import { auth } from "@/auth";
import { LeadsTable } from "@/components/admin/leads-table";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import type { LeadStatus } from "@prisma/client";

export default async function AdminLeadsPage({ searchParams }: { searchParams: { status?: string; unread?: string } }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/login");
  }

  const allowedStatuses: (LeadStatus | "ALL")[] = [
    "ALL",
    "NEW",
    "OPEN",
    "IN_PROGRESS",
    "ATTEMPTED_TO_CONTACT",
    "CONNECTED",
    "APPOINTMENT_SCHEDULED",
    "QUALIFIED_TO_BUY",
    "CONTRACT_SENT",
    "OPEN_DEAL",
    "CLOSED_WON",
    "CLOSED_LOST",
    "UNQUALIFIED",
    "BAD_TIMING",
    "NOT_A_FIT",
  ];
  const initialStatusFilter = (searchParams?.status as LeadStatus | "ALL") ?? "ALL";
  const statusFilter = allowedStatuses.includes(initialStatusFilter) ? initialStatusFilter : "ALL";
  const initialUnreadOnly = searchParams?.unread === "true";

  const leads = await prisma.lead.findMany({
    where: { fullName: { not: null } },
    include: {
      activities: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: [{ unread: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <LeadsTable
        initialLeads={leads.map((lead) => ({
          id: lead.id,
          fullName: lead.fullName ?? "—",
          company: lead.company,
          email: lead.email,
          phone: lead.phone,
          website: lead.website,
          message: lead.message,
          leadStatus: lead.leadStatus,
          unread: lead.unread,
          notes: lead.notes,
          leadScore: lead.leadScore,
          score: lead.score,
          priority: lead.priority,
          aiSummary: null,
          source: lead.source,
          owner: lead.assignedTo,
          activities: lead.activities.map((activity) => ({
            id: activity.id,
            type: activity.type,
            message: activity.message,
            metadata: activity.metadata ?? null,
            createdAt: activity.createdAt.toISOString(),
          })),
          lastActivityAt: lead.activities?.[0]?.createdAt?.toISOString?.() ?? null,
          value: null,
          budgetRange: lead.budgetRange,
          serviceInterest: lead.serviceInterest,
          targetDeadline: lead.targetDeadline?.toISOString(),
          meetingAt: lead.meetingAt?.toISOString(),
          meetingType: lead.meetingType,
          meetingLink: lead.meetingLink,
          decisionMaker: lead.decisionMaker,
          qualificationNotes: lead.qualificationNotes,
          decisionCriteriaNotes: lead.decisionCriteriaNotes,
          decisionProcessNotes: lead.decisionProcessNotes,
          paperProcessNotes: lead.paperProcessNotes,
          competitionNotes: lead.competitionNotes,
          mustHaveFeatures: lead.mustHaveFeatures,
          referenceSites: lead.referenceSites,
          nextFollowUpAt: lead.nextFollowUpAt?.toISOString(),
          createdAt: lead.createdAt.toISOString(),
          updatedAt: lead.updatedAt?.toISOString?.(),
          repliedAt: null,
        }))}
        initialStatusFilter={statusFilter}
        initialUnreadOnly={initialUnreadOnly}
      />
    </div>
  );
}
