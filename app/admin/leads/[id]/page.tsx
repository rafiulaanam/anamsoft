import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadQualificationForm } from "../_components/lead-qualification-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      fullName: true,
      company: true,
      email: true,
      website: true,
      message: true,
      leadStatus: true,
      unread: true,
      notes: true,
      source: true,
      budgetRange: true,
      leadScore: true,
      bantBudgetConfirmed: true,
      bantAuthorityConfirmed: true,
      bantNeedConfirmed: true,
      bantTimelineConfirmed: true,
      decisionCriteriaNotes: true,
      decisionProcessNotes: true,
      paperProcessNotes: true,
      competitionNotes: true,
      championIdentified: true,
      disqualifyReason: true,
      disqualifyNote: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!lead) notFound();

  const created = lead.createdAt.toLocaleString();
  const updated = lead.updatedAt ? lead.updatedAt.toLocaleString() : created;

  const displayName = lead.fullName ?? "—";

  return (
    <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{displayName}</h1>
              <p className="text-sm text-muted-foreground">{lead.company ?? "—"}</p>
            </div>
            <Badge variant={!lead.unread ? "secondary" : "destructive"}>{!lead.unread ? "Read" : "Unread"}</Badge>
          </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="qualification">Qualification</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Field label="Email" value={lead.email || "—"} />
                <Field label="Website" value={lead.website || "—"} />
                <Field label="Status" value={lead.leadStatus} />
                <Field label="Source" value={lead.source || "—"} />
                <Field label="Budget range" value={lead.budgetRange || "—"} />
                <Field label="Disqualified reason" value={lead.disqualifyReason || "—"} />
                <Field label="Created" value={created} />
                <Field label="Updated" value={updated} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{lead.message}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{lead.notes || "No notes yet."}</p>
              <Button asChild variant="outline">
                <Link href="/admin/leads">Back to leads</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualification">
          <LeadQualificationForm
            leadId={lead.id}
            notes={lead.notes}
            isRead={!lead.unread}
            leadScore={lead.leadScore}
            scoreReasons={[]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
