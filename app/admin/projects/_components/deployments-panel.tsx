"use client";

import { useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { addDeploymentLog } from "../_actions/deployments";

type Deployment = {
  id: string;
  environment: string;
  versionTag?: string | null;
  notes?: string | null;
  deployedAt: Date | string;
};

type Props = {
  projectId: string;
  deployments: Deployment[];
};

export function DeploymentsPanel({ projectId, deployments }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ environment: "STAGING", versionTag: "", notes: "" });
  const lastToastRef = useRef<string | number | undefined>(undefined);

  const add = () => {
    startTransition(async () => {
      const res = await addDeploymentLog(projectId, {
        environment: form.environment as any,
        versionTag: form.versionTag || undefined,
        notes: form.notes || undefined,
      });
      const nonce = res?.nonce ?? res?.updatedAt ?? Date.now();
      if (lastToastRef.current !== nonce) {
        lastToastRef.current = nonce;
        toast({ title: res.ok ? "Deployment logged" : "Add failed", description: res.message, variant: res.ok ? "default" : "destructive" });
      }
      if (res.ok) {
        router.refresh();
        setForm({ environment: "STAGING", versionTag: "", notes: "" });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr,1fr,120px]">
          <Select value={form.environment} onValueChange={(v) => setForm((f) => ({ ...f, environment: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STAGING">Staging</SelectItem>
              <SelectItem value="PRODUCTION">Production</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Version tag"
            value={form.versionTag}
            onChange={(e) => setForm((f) => ({ ...f, versionTag: e.target.value }))}
            disabled={pending}
          />
          <Button onClick={add} disabled={pending}>
            Log
          </Button>
        </div>
        <Input
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          disabled={pending}
        />

        {deployments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No deployments logged yet.</p>
        ) : (
          <div className="space-y-2">
            {deployments.map((d) => (
              <div key={d.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{d.environment}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(d.deployedAt), "yyyy-MM-dd HH:mm")}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{d.versionTag || "No tag"}</p>
                </div>
                {d.notes && <p className="mt-1 text-sm text-muted-foreground">{d.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
