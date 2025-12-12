import { PageHeaderSkeleton, CardListSkeleton } from "@/components/skeletons/base-skeletons";

export default function LoadingAdminProjectDetail() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-6 md:grid-cols-[1.4fr,1fr]">
        <CardListSkeleton cards={1} />
        <CardListSkeleton cards={1} />
      </div>
    </div>
  );
}
