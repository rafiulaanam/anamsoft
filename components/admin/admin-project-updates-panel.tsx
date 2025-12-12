"use client";

import { useState } from "react";
import type { ProjectUpdate } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface AdminProjectUpdatesPanelProps {
  projectId: string;
  initialUpdates: ProjectUpdate[];
}

const formatDate = (value: Date) =>
  new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function AdminProjectUpdatesPanel({ projectId, initialUpdates }: AdminProjectUpdatesPanelProps) {
  const [updates, setUpdates] = useState<ProjectUpdate[]>(initialUpdates);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleAddUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast({ variant: "destructive", title: "Title is required" });
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/projects/${projectId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          createdBy: "Admin",
        }),
      });
      if (!res.ok) throw new Error("Failed to create update");
      const json = await res.json();
      const newUpdate: ProjectUpdate = json.data;
      setUpdates((prev) => [newUpdate, ...prev]);
      setTitle("");
      setMessage("");
      toast({ title: "Update added", description: "Clients will see this in their portal." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Could not add project update." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle>Project updates</CardTitle>
        <CardDescription>Add quick progress notes and share them with the client.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAddUpdate} className="space-y-3">
          <Input
            placeholder="Update title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="Details for the client (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add update"}
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          {updates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No updates yet. Add your first update above.</p>
          ) : (
            updates.map((u) => (
              <div key={u.id} className="border-l pl-3 ml-1 space-y-1">
                <p className="text-sm font-medium">{u.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(u.createdAt)} {u.createdBy ? `· ${u.createdBy}` : ""}
                </p>
                {u.message && <p className="text-sm text-muted-foreground whitespace-pre-line">{u.message}</p>}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
