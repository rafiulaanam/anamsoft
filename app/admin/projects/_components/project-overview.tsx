"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { setProjectDates } from "../_actions/projects";
import { Badge } from "@/components/ui/badge";

type Props = {
  project: any;
  health: { label: string; hint: string };
  reqPct: number;
};

export function ProjectOverview({ project, health, reqPct }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [startDate, setStartDate] = useState(project.startDate ? project.startDate.toISOString?.().slice(0, 10) || project.startDate.slice(0, 10) : "");
  const [deadline, setDeadline] = useState(project.deadline ? project.deadline.toISOString?.().slice(0, 10) || project.deadline.slice(0, 10) : "");
  const [pending, startTransition] = useTransition();
  const lastToastRef = useRef<string | number | undefined>(undefined);

  const saveDates = () => {
    startTransition(async () => {
      const res = await setProjectDates(project.id, startDate || undefined, deadline || undefined);
      const nonce = res?.nonce ?? res?.updatedAt ?? Date.now();
      if (lastToastRef.current !== nonce) {
        lastToastRef.current = nonce;
        toast({ title: res.ok ? "Dates updated" : "Update failed", description: res.message, variant: res.ok ? "default" : "destructive" });
      }
      if (res.ok) router.refresh();
    });
  };

  const urls = [
    { label: "Repo", value: project.repoUrl },
    { label: "Staging", value: project.stagingUrl },
    { label: "Production", value: project.productionUrl },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Scope summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{project.scopeSummary || "No scope summary yet."}</p>
          <div className="mt-4 space-y-1">
            <p className="text-sm font-medium">Requirements progress</p>
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${reqPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{reqPct}% complete</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Start date</p>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={pending} />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Deadline</p>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} disabled={pending} />
          </div>
          <Button className="w-full" onClick={saveDates} disabled={pending}>
            Save dates
          </Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {urls.map((u) => (
            <LinkCard key={u.label} label={u.label} value={u.value} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function LinkCard({ label, value }: { label: string; value?: string | null }) {
  const { toast } = useToast();
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      toast({ title: "Copied link" });
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {value ? (
          <>
            <p className="text-sm text-muted-foreground break-all">{value}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={value} target="_blank">
                  Open
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                Copy
              </Button>
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Not set</p>
        )}
      </CardContent>
    </Card>
  );
}
