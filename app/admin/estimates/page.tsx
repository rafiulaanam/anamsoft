import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AdminEstimatesTable } from "@/components/admin/admin-estimates-table";

export const metadata: Metadata = {
  title: "Project estimates | Admin | AnamSoft",
};


export default async function AdminEstimatesPage() {
  const estimates = await prisma.projectEstimate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Project estimates</h1>
        <p className="text-sm text-muted-foreground">
          All project estimator submissions from your public site will appear here.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-sm text-muted-foreground">Total estimates: {estimates.length}</p>
        <AdminEstimatesTable estimates={estimates} />
      </div>
    </div>
  );
}
