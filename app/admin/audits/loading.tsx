import { PageHeaderSkeleton, TableSkeleton } from "@/components/skeletons/base-skeletons";

export default function LoadingAdminAudits() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}
