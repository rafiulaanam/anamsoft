import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Website audit | Admin | AnamSoft",
};

export const dynamic = "force-dynamic";

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
            <p className="text-sm text-muted-foreground">Main goal / problems</p>
            <p className="text-sm text-slate-800 whitespace-pre-line">{(audit as any).mainGoal || "Not specified"}</p>
          </div>
          {audit.message && (
            <div>
              <p className="text-sm text-muted-foreground">Message</p>
              <p className="text-sm text-slate-800 whitespace-pre-line">{audit.message}</p>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Label className="text-sm font-medium">Status</Label>
            <Badge variant="outline">{audit.status || "NEW"}</Badge>
            <p className="text-xs text-muted-foreground">Status updates are currently read-only.</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={audit.websiteUrl} target="_blank">
                Open website
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <a href={`mailto:${audit.email}?subject=Website audit for ${audit.name}`}>
                Reply by email
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
