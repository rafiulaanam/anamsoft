"use client";

import { useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { addMilestone, deleteMilestone, reorderMilestones, setMilestoneStatus, updateMilestone } from "../_actions/milestones";

type Milestone = {
  id: string;
  title: string;
  dueDate: Date | string | null;
  status: string;
  sortOrder: number;
};

type Props = {
  projectId: string;
  milestones: Milestone[];
};

export function MilestonesPanel({ projectId, milestones }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ title: "", dueDate: "" });
  const lastToastRef = useRef<string | number | undefined>(undefined);

  const add = () => {
    if (!form.title) return;
    const fd = new FormData();
    fd.append("title", form.title);
    if (form.dueDate) fd.append("dueDate", form.dueDate);
    startTransition(async () => {
      const res = await addMilestone(projectId, fd);
      const nonce = res?.nonce ?? res?.updatedAt ?? Date.now();
      if (lastToastRef.current !== nonce) {
        lastToastRef.current = nonce;
        toast({ title: res.ok ? "Milestone added" : "Add failed", description: res.message, variant: res.ok ? "default" : "destructive" });
      }
      if (res.ok) {
        router.refresh();
        setForm({ title: "", dueDate: "" });
      }
    });
  };

  const setStatus = (id: string, status: string) => {
    startTransition(async () => {
      const res = await setMilestoneStatus(id, status);
      const nonce = res?.nonce ?? res?.updatedAt ?? Date.now();
      if (lastToastRef.current !== nonce) {
        lastToastRef.current = nonce;
        if (!res.ok) toast({ title: "Update failed", description: res.message, variant: "destructive" });
      }
      if (res.ok) router.refresh();
    });
  };

  const reorder = (idx: number, dir: "up" | "down") => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= milestones.length) return;
    const orderedIds = [...milestones].sort((a, b) => a.sortOrder - b.sortOrder).map((m) => m.id);
    const updated = [...orderedIds];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    startTransition(async () => {
      const res = await reorderMilestones(projectId, updated);
      const nonce = res?.nonce ?? res?.updatedAt ?? Date.now();
      if (lastToastRef.current !== nonce) {
        lastToastRef.current = nonce;
        if (!res.ok) toast({ title: "Reorder failed", description: res.message, variant: "destructive" });
      }
      if (res.ok) router.refresh();
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      if (!window.confirm("Delete this milestone?")) return;
      const res = await deleteMilestone(id);
      const nonce = res?.nonce ?? res?.updatedAt ?? Date.now();
      if (lastToastRef.current !== nonce) {
        lastToastRef.current = nonce;
        if (!res.ok) toast({ title: "Delete failed", description: res.message, variant: "destructive" });
      }
      if (res.ok) router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr,180px,120px]">
          <Input
            placeholder="Milestone title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            disabled={pending}
          />
          <Input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            disabled={pending}
          />
          <Button onClick={add} disabled={pending || !form.title}>
            Add
          </Button>
        </div>

        {milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground">No milestones yet.</p>
        ) : (
          <div className="space-y-2">
            {milestones.map((m, idx) => (
              <div key={m.id} className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.dueDate ? format(new Date(m.dueDate), "yyyy-MM-dd") : "No due date"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={m.status} onValueChange={(v) => setStatus(m.id, v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {["NOT_STARTED", "IN_PROGRESS", "DONE"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => reorder(idx, "up")} disabled={pending || idx === 0}>
                    Up
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => reorder(idx, "down")} disabled={pending || idx === milestones.length - 1}>
                    Down
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => remove(m.id)} disabled={pending}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
