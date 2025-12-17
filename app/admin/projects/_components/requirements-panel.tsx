"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { addRequirement, bulkToggleGroupDone, reorderRequirements, toggleRequirementDone, deleteRequirement } from "../_actions/requirements";

type Requirement = {
  id: string;
  group: string;
  label: string;
  isDone: boolean;
  sortOrder: number;
};

type Props = {
  projectId: string;
  requirements: Requirement[];
};

export function RequirementsPanel({ projectId, requirements }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [items, setItems] = useState(requirements);
  const [rowPending, setRowPending] = useState<string | null>(null);
  const [form, setForm] = useState({ group: "General", label: "" });
  const [pending, startTransition] = useTransition();
  const lastToastRef = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    setItems(requirements);
  }, [requirements]);

  const grouped = useMemo(() => {
    const map: Record<string, Requirement[]> = {};
    items.forEach((r) => {
      map[r.group] = map[r.group] || [];
      map[r.group].push(r);
    });
    return map;
  }, [items]);

  const add = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("group", form.group);
      fd.append("label", form.label);
      const res = await addRequirement(projectId, fd);
      const nonce = res?.nonce ?? res?.updatedAt ?? Date.now();
      if (lastToastRef.current !== nonce) {
        lastToastRef.current = nonce;
        toast({ title: res.ok ? "Requirement added" : "Add failed", description: res.message, variant: res.ok ? "default" : "destructive" });
      }
      if (res.ok) {
        router.refresh();
        setForm((f) => ({ ...f, label: "" }));
      }
    });
  };

  const toggle = (id: string, nextChecked: boolean) => {
    startTransition(async () => {
      setRowPending(id);
      const res = await toggleRequirementDone(id);
      const nonce = res?.nonce ?? res?.updatedAt ?? Date.now();
      if (lastToastRef.current !== nonce) {
        lastToastRef.current = nonce;
        if (!res.ok) toast({ title: "Update failed", description: res.message, variant: "destructive" });
      }
      if (res.ok) {
        // Optimistic update
        setItems((prev) => prev.map((r) => (r.id === id ? { ...r, isDone: nextChecked } : r)));
        router.refresh();
      }
      setRowPending(null);
    });
  };

  const bulkGroup = (group: string) => {
    startTransition(async () => {
      const res = await bulkToggleGroupDone(projectId, group);
      const nonce = res?.nonce ?? res?.updatedAt ?? Date.now();
      if (lastToastRef.current !== nonce) {
        lastToastRef.current = nonce;
        if (!res.ok) toast({ title: "Update failed", description: res.message, variant: "destructive" });
      }
      if (res.ok) router.refresh();
    });
  };

  const reorder = (group: string, idx: number, dir: "up" | "down") => {
    const groupItems = grouped[group];
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= groupItems.length) return;
    const newOrder = [...groupItems];
    [newOrder[idx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[idx]];
    const orderedIds = newOrder.map((r) => r.id);
    startTransition(async () => {
      const res = await reorderRequirements(projectId, orderedIds);
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
      if (!window.confirm("Delete this requirement?")) return;
      const res = await deleteRequirement(id);
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
        <CardTitle>Requirements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[180px,1fr,120px]">
          <Input
            placeholder="Group"
            value={form.group}
            onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
            disabled={pending}
          />
          <Textarea
            placeholder="Requirement"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            disabled={pending}
            rows={1}
          />
          <Button onClick={add} disabled={pending || !form.label}>
            Add
          </Button>
        </div>

        {Object.entries(grouped).length === 0 ? (
          <p className="text-sm text-muted-foreground">No requirements yet.</p>
        ) : (
          Object.entries(grouped).map(([group, reqs]) => (
            <div key={group} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{group}</p>
                  <span className="text-xs text-muted-foreground">
                    {reqs.filter((r) => r.isDone).length}/{reqs.length} done
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => bulkGroup(group)} disabled={pending}>
                    Mark group done/undone
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {reqs.map((req, idx) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={req.isDone}
                        onChange={(e) => toggle(req.id, e.target.checked)}
                        disabled={pending || rowPending === req.id}
                      />
                      <span className={req.isDone ? "line-through text-muted-foreground" : ""}>{req.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => reorder(group, idx, "up")} disabled={pending || idx === 0}>
                        Up
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reorder(group, idx, "down")}
                        disabled={pending || idx === reqs.length - 1}
                      >
                        Down
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(req.id)} disabled={pending}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
