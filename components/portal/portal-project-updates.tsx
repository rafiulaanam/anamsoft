"use client";

import type { ProjectUpdate } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formatDate = (value: Date) =>
  new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface PortalProjectUpdatesProps {
  updates: ProjectUpdate[];
}

export function PortalProjectUpdates({ updates }: PortalProjectUpdatesProps) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle>Project updates</CardTitle>
        <CardDescription>Latest progress and messages from AnamSoft.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {updates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No updates have been posted yet.</p>
        ) : (
          updates.map((u) => (
            <div key={u.id} className="border-l pl-3 ml-1 space-y-1">
              <p className="text-sm font-medium">{u.title}</p>
              <p className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</p>
              {u.message && <p className="text-sm text-muted-foreground whitespace-pre-line">{u.message}</p>}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
