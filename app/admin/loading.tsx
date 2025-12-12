import { PageHeaderSkeleton, CardListSkeleton } from "@/components/skeletons/base-skeletons";

export default function LoadingAdminOverview() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardListSkeleton cards={3} />
    </div>
  );
}
