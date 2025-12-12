"use client";

import { useState } from "react";
import type { ProjectTask } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface PortalProjectChecklistProps {
  projectId: string;
  tasks: ProjectTask[];
}

export function PortalProjectChecklist({ projectId, tasks }: PortalProjectChecklistProps) {
  const [localTasks, setLocalTasks] = useState<ProjectTask[]>(tasks);
  const { toast } = useToast();

  const requiredTasks = localTasks.filter((t) => t.isRequired);
  const completedRequired = requiredTasks.filter((t) => t.isCompletedByClient);
  const progress = requiredTasks.length
    ? Math.round((completedRequired.length / requiredTasks.length) * 100)
    : 0;

  const toggleTask = async (taskId: string, isCompleted: boolean) => {
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompletedByClient: isCompleted } : t))
    );
    try {
      const res = await fetch(`/api/portal/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompletedByClient: isCompleted }),
      });
      if (!res.ok) throw new Error("Failed to update task");
    } catch (error) {
      console.error(error);
      setLocalTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, isCompletedByClient: !isCompleted } : t))
      );
      toast({ variant: "destructive", title: "Could not update task" });
    }
  };

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle>Content checklist</CardTitle>
        <CardDescription>
          Mark items as you provide content or approvals. Required items are needed for launch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Required items completed</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="space-y-3">
          {localTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No checklist items yet.</p>
          ) : (
            localTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between gap-3 rounded-xl border px-3 py-2"
              >
                <div className="flex flex-1 items-start gap-3">
                  <Checkbox
                    checked={task.isCompletedByClient}
                    onChange={(e) => toggleTask(task.id, e.target.checked)}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                  </div>
                </div>
                {task.isRequired && <Badge variant="outline">Required</Badge>}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
