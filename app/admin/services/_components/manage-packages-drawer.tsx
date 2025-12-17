"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PackagesEditor } from "./packages-editor";
import type { ServicePackageWithFeatures } from "../types";

type Props = {
  open: boolean;
  serviceId: string | null;
  serviceTitle?: string;
  onOpenChange: (open: boolean) => void;
};

export function ManagePackagesDrawer({ open, serviceId, serviceTitle, onOpenChange }: Props) {
  const [packages, setPackages] = useState<ServicePackageWithFeatures[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    if (!serviceId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/services/${serviceId}/packages`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to load packages");
      }
      const data: ServicePackageWithFeatures[] = await response.json();
      setPackages(
        data.map((pkg) => ({
          ...pkg,
          priceFrom: pkg.priceFrom ?? null,
          features: pkg.features ?? [],
        }))
      );
    } catch (err) {
      setError((err as Error).message || "Unable to load packages");
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    if (!open) {
      setPackages([]);
      return;
    }
    if (serviceId) {
      fetchPackages();
    }
  }, [open, serviceId, fetchPackages]);

  const activityLog = useMemo(
    () =>
      [...packages]
        .sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 4),
    [packages]
  );

  return (
    <Sheet open={open} onOpenChange={(value) => onOpenChange(value)}>
      <SheetContent className="flex h-[100dvh] max-h-[100dvh] w-full min-w-[320px] flex-col overflow-hidden pb-0 sm:max-w-[92vw] md:max-w-[720px] lg:max-w-[820px] xl:max-w-[900px] 2xl:max-w-[1020px]">
        <SheetHeader className="px-6 pb-2 pt-5">
          <SheetTitle>Manage packages</SheetTitle>
          <SheetDescription>
            {serviceTitle ?? "Service"} · Any update will refresh the landing pricing cards.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading && (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              Loading packages…
            </div>
          )}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {serviceId ? (
            <PackagesEditor
              key={serviceId}
              serviceId={serviceId}
              initialPackages={packages}
              onPackagesChange={setPackages}
            />
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              Select a service to manage packages.
            </div>
          )}

          {activityLog.length > 0 && (
            <div className="mt-6 space-y-2 rounded-xl border border-dashed border-slate-200 bg-white/80 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                Activity
              </p>
              <ul className="space-y-1">
                {activityLog.map((pkg) => (
                  <li key={pkg.id} className="text-slate-700">
                    <span className="font-semibold text-slate-900">{pkg.title ?? "Untitled package"}</span> updated{" "}
                    {formatDistanceToNow(new Date(pkg.updatedAt), { addSuffix: true })}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <SheetFooter className="px-6 pb-6 pt-0">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
