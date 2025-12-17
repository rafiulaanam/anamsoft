import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LeadStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type LeadRow = {
  id: string;
  fullName: string;
  email: string | null;
  company: string | null;
  leadStatus: LeadStatus;
  unread: boolean;
  createdAt: string;
};

export default async function AdminOverviewPage() {
  const now = new Date();
  const [servicesCount, portfolioCount, leadsCount, unreadLeadsCount, recentLeads] = await Promise.all([
    prisma.service.count({ where: { deletedAt: null } }).catch(() => 0),
    prisma.portfolioItem.count().catch(() => 0),
    prisma.lead.count().catch(() => 0),
    prisma.lead.count({ where: { unread: true } }).catch(() => 0),
    prisma.lead
      .findMany({
        orderBy: [{ unread: "desc" }, { createdAt: "desc" }],
        take: 5,
        select: { id: true, fullName: true, email: true, company: true, leadStatus: true, unread: true, createdAt: true },
      })
      .catch(() => []),
  ]);

  const leadRows: LeadRow[] = recentLeads.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-600">Anam Soft Admin</p>
        </div>
        <p className="text-xs text-muted-foreground">Last updated: {now.toLocaleString()}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Services" value={servicesCount} href="/admin/services" />
        <KpiCard label="Portfolio" value={portfolioCount} href="/admin/portfolio" />
        <KpiCard label="Leads" value={`${leadsCount} (${unreadLeadsCount} unread)`} href="/admin/leads?status=NEW&unread=true" />
        <KpiCard label="Projects" value="View" href="/admin/projects" ctaOnly />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/admin/services/new">New Service</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/portfolio/new">New Portfolio Item</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/leads?unread=true">View Leads</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/projects/new">New Project</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/testimonials">Testimonials</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/faqs">FAQs</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent leads</CardTitle>
        </CardHeader>
        <CardContent>
          {leadRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads yet.</p>
          ) : (
            <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Salon</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
              <TableBody>
                {leadRows.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/leads/${lead.id}`} className="hover:underline">
                      {lead.fullName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.email || "—"}</TableCell>
                  <TableCell>{lead.company ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={!lead.unread ? "secondary" : "destructive"}>
                      {!lead.unread ? "Read" : "Unread"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/leads/${lead.id}`}>Open</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ label, value, href, ctaOnly }: { label: string; value: number | string; href: string; ctaOnly?: boolean }) {
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
