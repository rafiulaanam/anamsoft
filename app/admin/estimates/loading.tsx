import { PageHeaderSkeleton, TableSkeleton } from "@/components/skeletons/base-skeletons";

export default function LoadingAdminEstimates() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
