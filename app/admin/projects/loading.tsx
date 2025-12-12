import { PageHeaderSkeleton, TableSkeleton } from "@/components/skeletons/base-skeletons";

export default function LoadingAdminProjects() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={6} columns={6} />
    </div>
  );
}
