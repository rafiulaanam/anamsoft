import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Website audits | Admin | AnamSoft",
};

export const dynamic = "force-dynamic";

const formatDate = (value: Date) =>
  new Date(value).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function AdminAuditsPage() {
  const audits = await prisma.websiteAudit.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Website audits</h1>
        <p className="text-sm text-muted-foreground">All free audit requests submitted from the public form.</p>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3 overflow-x-auto">
        <p className="text-sm text-muted-foreground">Total audits: {audits.length}</p>
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b">
              <th className="py-2 pr-3">Date</th>
              <th className="py-2 pr-3">Name / Business</th>
              <th className="py-2 pr-3">Website</th>
              <th className="py-2 pr-3">Main problems</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {audits.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-muted-foreground">
                  No website audits yet.
                </td>
              </tr>
            )}
            {audits.map((audit) => (
              <tr key={audit.id}>
                <td className="py-2 pr-3 whitespace-nowrap">{formatDate(audit.createdAt)}</td>
                <td className="py-2 pr-3">
                  <div className="font-medium text-slate-900">{audit.name}</div>
                  {audit.businessName && <div className="text-xs text-muted-foreground">{audit.businessName}</div>}
                </td>
                <td className="py-2 pr-3">
                  <a href={audit.websiteUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                    {audit.websiteUrl}
                  </a>
                </td>
                <td className="py-2 pr-3 text-xs text-muted-foreground">{audit.mainGoal || "Not specified"}</td>
                <td className="py-2 pr-3">
                  <Badge variant="outline">{audit.status || "NEW"}</Badge>
                </td>
                <td className="py-2 pr-3">
                  <Link href={`/admin/audits/${audit.id}`} className="text-primary underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
