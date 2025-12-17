"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LeadsError({ error }: { error: Error }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-6">
      <div>
        <p className="text-lg font-semibold text-destructive">Something went wrong</p>
        <p className="text-sm text-muted-foreground break-words">{error.message || "Failed to load leads."}</p>
      </div>
      <Button variant="destructive" onClick={() => router.refresh()}>
        Retry
      </Button>
    </div>
  );
}
