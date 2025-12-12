import { PageHeaderSkeleton, FormSkeleton } from "@/components/skeletons/base-skeletons";

export default function LoadingAdminSettings() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <FormSkeleton />
    </div>
  );
}
