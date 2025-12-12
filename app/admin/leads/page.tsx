import { auth } from "@/auth";
import { LeadsTable } from "@/components/admin/leads-table";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminLeadsPage() {
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
