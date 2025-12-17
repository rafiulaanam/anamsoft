"use client";

import { useCallback, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ProjectStatusValues } from "@/lib/validators/project";
import { updateProjectStatus } from "../_actions/projects";

type Props = {
  project: {
    id: string;
    name: string;
    status: string;
  };
  health: { label: string; hint: string };
};

export function ProjectHeader({ project, health }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const lastToastRef = useRef<string | number | undefined>(undefined);

  const setStatus = useCallback(
    (status: string) => {
      startTransition(async () => {
        const res = await updateProjectStatus(project.id, status);
        const nonce = res?.nonce ?? res?.updatedAt ?? Date.now();
        if (lastToastRef.current !== nonce) {
          lastToastRef.current = nonce;
          toast({ title: res.ok ? "Status updated" : "Update failed", description: res.message, variant: res.ok ? "default" : "destructive" });
        }
        if (res.ok) router.refresh();
      });
    },
    [project.id, router, toast]
  );

  return (
    <Card className="sticky top-4 z-10 border bg-card/80 backdrop-blur">
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <Badge variant="outline">{health.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{health.hint}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={pending}>
                Status: {project.status}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {ProjectStatusValues.map((s) => (
                <DropdownMenuItem key={s} onSelect={() => setStatus(s)}>
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" disabled>
            New task
          </Button>
          <Button variant="outline" size="sm" disabled>
            Add milestone
          </Button>
          <Button variant="outline" size="sm" disabled>
            Add file
          </Button>
          <Button variant="outline" size="sm" disabled>
            Log deployment
          </Button>
        </div>
      </div>
    </Card>
  );
}
