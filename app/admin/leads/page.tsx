import { auth } from "@/auth";
import { LeadsTable } from "@/components/admin/leads-table";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1";

export default async function AdminLeadsPage() {
  if (isBuild) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">Leads are unavailable during build.</div>
      </div>
    );
  }
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/login");
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <LeadsTable
        initialLeads={leads.map((lead) => ({
          ...lead,
          createdAt: lead.createdAt.toISOString(),
          updatedAt: lead.updatedAt?.toISOString?.() ?? undefined,
        }))}
      />
    </div>
  );
}
