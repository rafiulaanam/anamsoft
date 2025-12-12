import { Skeleton } from "@/components/ui/skeleton";

export default function RootMarketingLoading() {
  return (
    <div className="space-y-10 px-4 py-10">
      <section className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-3/4 max-w-xl" />
        <Skeleton className="h-4 w-2/3 max-w-md" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </section>
      <section className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full max-w-2xl" />
        <Skeleton className="h-3 w-5/6 max-w-xl" />
      </section>
      <section className="space-y-4">
        <Skeleton className="h-4 w-28" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-2xl border bg-card p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
