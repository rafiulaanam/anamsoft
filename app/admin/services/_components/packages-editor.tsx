"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  createPackage,
  deletePackage,
  movePackage,
  setPackageRecommended,
  togglePackageActive,
  updatePackage,
} from "../actions";
import type { ServicePackageWithFeatures } from "../types";
import { PackageFeaturesEditor } from "./package-features-editor";

type Props = {
  serviceId: string;
  initialPackages: ServicePackageWithFeatures[];
  onPackagesChange?: (packages: ServicePackageWithFeatures[]) => void;
};

type PackageForm = {
  id: string;
  title: string;
  priceFrom: string;
  currency: string;
  deliveryDays: string;
  description: string;
  badge: string;
  ctaLabel: string;
  ctaHref: string;
  isFeaturedOnLanding: boolean;
  isRecommended: boolean;
  isActive: boolean;
};

const emptyForm: PackageForm = {
  id: "",
  title: "",
  priceFrom: "",
  currency: "EUR",
  deliveryDays: "",
  description: "",
  badge: "",
  ctaLabel: "",
  ctaHref: "",
  isFeaturedOnLanding: false,
  isRecommended: false,
  isActive: true,
};

export function PackagesEditor({ serviceId, initialPackages, onPackagesChange }: Props) {
  const { toast } = useToast();
  const [packages, setPackages] = useState<ServicePackageWithFeatures[]>(initialPackages ?? []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PackageForm>({ ...emptyForm });
  const [pending, startTransition] = useTransition();

  const sortedPackages = useMemo(
    () => [...packages].sort((a, b) => a.sortOrder - b.sortOrder),
    [packages]
  );

  const openNew = () => {
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (pkg: ServicePackageWithFeatures) => {
    setForm({
      id: pkg.id,
      title: pkg.title ?? "",
      priceFrom: pkg.priceFrom?.toString() ?? "",
      currency: pkg.currency ?? "EUR",
      deliveryDays: pkg.deliveryDays?.toString() ?? "",
      description: pkg.description ?? "",
      badge: pkg.badge ?? "",
      ctaLabel: pkg.ctaLabel ?? "",
      ctaHref: pkg.ctaHref ?? "",
      isFeaturedOnLanding: pkg.isFeaturedOnLanding,
      isRecommended: pkg.isRecommended,
      isActive: pkg.isActive,
    });
    setDialogOpen(true);
  };

  const syncPackages = (updated: ServicePackageWithFeatures[]) => {
    setPackages(updated.sort((a, b) => a.sortOrder - b.sortOrder));
  };

  useEffect(() => {
    setPackages(initialPackages ?? []);
  }, [initialPackages]);

  useEffect(() => {
    onPackagesChange?.(packages);
  }, [packages, onPackagesChange]);

  const handleSave = () => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("priceFrom", form.priceFrom);
    fd.append("currency", form.currency);
    if (form.deliveryDays) fd.append("deliveryDays", form.deliveryDays);
    if (form.description) fd.append("description", form.description);
    if (form.badge) fd.append("badge", form.badge);
    if (form.ctaLabel) fd.append("ctaLabel", form.ctaLabel);
    if (form.ctaHref) fd.append("ctaHref", form.ctaHref);
    fd.append("isFeaturedOnLanding", form.isFeaturedOnLanding ? "true" : "false");
    fd.append("isRecommended", form.isRecommended ? "true" : "false");
    fd.append("isActive", form.isActive ? "true" : "false");

    startTransition(async () => {
      const res = form.id
        ? await updatePackage(form.id, fd)
        : await createPackage(serviceId, fd);
      if (res.ok && res.data) {
        const next = form.id
          ? packages.map((p) => (p.id === (res.data as ServicePackageWithFeatures).id ? (res.data as ServicePackageWithFeatures) : p))
          : [...packages, res.data as ServicePackageWithFeatures];
        syncPackages(next);
        toast({ title: res.message || "Saved" });
        setDialogOpen(false);
      } else {
        toast({ title: "Save failed", description: res.message, variant: "destructive" });
      }
    });
  };

  const handleDelete = (pkgId: string) => {
    if (!confirm("Delete this package?")) return;
    const prev = packages;
    setPackages(packages.filter((p) => p.id !== pkgId));
    startTransition(async () => {
      const res = await deletePackage(pkgId);
      if (!res.ok) {
        setPackages(prev);
        toast({ title: "Delete failed", description: res.message, variant: "destructive" });
      } else {
        toast({ title: "Package deleted" });
      }
    });
  };

  const handleToggleActive = (pkgId: string) => {
    startTransition(async () => {
      const res = await togglePackageActive(pkgId);
      if (res.ok && res.data) {
        setPackages(packages.map((p) => (p.id === pkgId ? (res.data as ServicePackageWithFeatures) : p)));
      } else {
        toast({ title: "Toggle failed", description: res.message, variant: "destructive" });
      }
    });
  };

  const handleRecommend = (pkgId: string) => {
    startTransition(async () => {
      const res = await setPackageRecommended(pkgId);
      if (res.ok && res.data) {
        syncPackages(res.data as ServicePackageWithFeatures[]);
        toast({ title: "Recommended package set" });
      } else {
        toast({ title: "Update failed", description: res.message, variant: "destructive" });
      }
    });
  };

  const handleMove = (pkgId: string, dir: "up" | "down") => {
    startTransition(async () => {
      const res = await movePackage(pkgId, dir);
      if (res.ok && res.data) {
        syncPackages(res.data as ServicePackageWithFeatures[]);
      } else {
        toast({ title: "Reorder failed", description: res.message, variant: "destructive" });
      }
    });
  };

  const updateFeatures = (pkgId: string, features: string[]) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === pkgId ? { ...p, features } : p))
    );
  };

  const formatPrice = (pkg: ServicePackageWithFeatures) => {
    if (pkg.priceFrom == null) return "Custom quote";
    return `${pkg.currency ?? "EUR"} ${pkg.priceFrom}`;
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">Packages</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage tiers, pricing, and features. Customize featured landing packages.
          </p>
        </div>
        <Button onClick={openNew} size="sm" disabled={pending}>
          Add package
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedPackages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No packages yet.</p>
        ) : (
          sortedPackages.map((pkg, idx) => (
            <div key={pkg.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold">{pkg.title ?? "Untitled package"}</p>
                    {pkg.badge && <Badge>{pkg.badge}</Badge>}
                    {pkg.isFeaturedOnLanding && <Badge variant="secondary">Landing</Badge>}
                    {pkg.isRecommended && <Badge variant="outline">Recommended</Badge>}
                    {!pkg.isActive && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(pkg)}
                    {pkg.deliveryDays ? ` · ${pkg.deliveryDays} days` : ""}
                  </p>
                  {pkg.description && (
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  )}
                  {pkg.ctaLabel && pkg.ctaHref && (
                    <p className="text-xs text-muted-foreground">
                      CTA: <span className="font-semibold">{pkg.ctaLabel}</span>{" "}
                      <span className="text-slate-500">→</span>{" "}
                      <span className="text-slate-600 underline">{pkg.ctaHref}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMove(pkg.id, "up")}
                    disabled={pending || idx === 0}
                  >
                    Up
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMove(pkg.id, "down")}
                    disabled={pending || idx === sortedPackages.length - 1}
                  >
                    Down
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(pkg.id)}
                    disabled={pending}
                  >
                    {pkg.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRecommend(pkg.id)}
                    disabled={pending}
                  >
                    Set recommended
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(pkg)} disabled={pending}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(pkg.id)}
                    disabled={pending}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <PackageFeaturesEditor
                packageId={pkg.id}
                initialFeatures={pkg.features ?? []}
                onFeaturesChange={(items) => updateFeatures(pkg.id, items)}
              />
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit package" : "Add package"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pkg-title">Title</Label>
              <Input
                id="pkg-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                disabled={pending}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr,120px]">
              <div className="space-y-1.5">
                <Label htmlFor="pkg-price-from">Price (from)</Label>
                <Input
                  id="pkg-price-from"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.priceFrom}
                  onChange={(e) => setForm((f) => ({ ...f, priceFrom: e.target.value }))}
                  disabled={pending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-currency">Currency</Label>
                <Input
                  id="pkg-currency"
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  disabled={pending}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pkg-delivery">Delivery days</Label>
              <Input
                id="pkg-delivery"
                type="number"
                min="0"
                value={form.deliveryDays}
                onChange={(e) => setForm((f) => ({ ...f, deliveryDays: e.target.value }))}
                disabled={pending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pkg-description">Description</Label>
              <Textarea
                id="pkg-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                disabled={pending}
                rows={3}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pkg-badge">Badge</Label>
                <Input
                  id="pkg-badge"
                  value={form.badge}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                  disabled={pending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-cta-label">CTA label</Label>
                <Input
                  id="pkg-cta-label"
                  value={form.ctaLabel}
                  onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                  disabled={pending}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pkg-cta-href">CTA link</Label>
              <Input
                id="pkg-cta-href"
                value={form.ctaHref}
                onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))}
                disabled={pending}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 rounded-md border px-3 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Featured on landing</p>
                    <p className="text-xs text-muted-foreground">
                      Highlight this package in the pricing section.
                    </p>
                  </div>
                  <Switch
                    checked={form.isFeaturedOnLanding}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, isFeaturedOnLanding: v }))}
                    disabled={pending}
                  />
                </div>
              </div>
              <div className="flex-1 rounded-md border px-3 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">Show this package to clients.</p>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                    disabled={pending}
                  />
                </div>
              </div>
              <div className="flex-1 rounded-md border px-3 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Recommended</p>
                    <p className="text-xs text-muted-foreground">
                      Only one package can be recommended per service.
                    </p>
                  </div>
                  <Switch
                    checked={form.isRecommended}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, isRecommended: v }))}
                    disabled={pending}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={pending || !form.title}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
