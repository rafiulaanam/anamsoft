import { PageHeaderSkeleton, CardListSkeleton } from "@/components/skeletons/base-skeletons";

export default function LoadingAdminKanban() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardListSkeleton cards={4} />
    </div>
  );
}
