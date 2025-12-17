"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminOverviewError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error("Admin overview error:", error);
  }, [error]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>We couldn’t load the overview data. Please retry.</p>
        <div className="flex gap-2">
          <Button onClick={() => reset()}>Retry</Button>
          <Button variant="outline" onClick={() => router.refresh()}>
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
