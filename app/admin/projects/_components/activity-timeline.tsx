"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Activity = {
  id: string;
  type: string;
  message: string;
  createdAt: Date | string;
};

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{a.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.type} · {format(new Date(a.createdAt), "yyyy-MM-dd HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
