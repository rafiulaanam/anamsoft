import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export const metadata: Metadata = {
  title: "Website audit | Admin | AnamSoft",
};

export const dynamic = "force-dynamic";

const statuses = ["NEW", "IN_PROGRESS", "DONE"];

async function updateStatus(id: string, status: string) {
  "use server";
  await prisma.websiteAudit.update({
    where: { id },
    data: { status },
  });
}

export default async function AdminAuditDetailPage({ params }: { params: { id: string } }) {
  const audit = await prisma.websiteAudit.findUnique({
    where: { id: params.id },
  });

  if (!audit) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Website audit</h1>
          <p className="text-sm text-muted-foreground">Review the submission and update the status when done.</p>
        </div>
        <Badge variant="outline">{audit.status || "NEW"}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium text-slate-900">{audit.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <a className="text-primary underline" href={`mailto:${audit.email}`}>
              {audit.email}
            </a>
          </div>
          {audit.businessName && (
            <div>
              <p className="text-sm text-muted-foreground">Business name</p>
              <p className="font-medium text-slate-900">{audit.businessName}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Website</p>
            <a className="text-primary underline" href={audit.websiteUrl} target="_blank" rel="noreferrer">
              {audit.websiteUrl}
            </a>
          </div>
          {audit.businessType && (
            <div>
              <p className="text-sm text-muted-foreground">Business type</p>
              <p className="font-medium text-slate-900">{audit.businessType}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Main problems</p>
            <ul className="list-disc list-inside text-sm">
              {audit.mainProblems.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>
          {audit.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-sm text-slate-800 whitespace-pre-line">{audit.notes}</p>
            </div>
          )}

          <form action={updateStatus.bind(null, audit.id)} className="space-y-2 pt-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select name="status" defaultValue={audit.status || "NEW"}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" size="sm">
              Update status
            </Button>
          </form>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={audit.websiteUrl} target="_blank">
                Open website
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <a href={`mailto:${audit.email}?subject=Website audit for ${audit.businessName ?? "your site"}`}>
                Reply by email
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
