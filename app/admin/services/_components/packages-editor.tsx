"use client";

import { useMemo, useState, useTransition } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  createPackage,
  deletePackage,
  movePackage,
  setPackageRecommended,
  togglePackageActive,
  updatePackage,
} from "../actions";
import type { ServicePackageWithItems } from "../types";
import { PackageItemsEditor } from "./package-items-editor";

type Props = {
  serviceId: string;
  initialPackages: ServicePackageWithItems[];
};

const emptyForm = {
  id: "",
  name: "",
  price: "",
  currency: "EUR",
  deliveryDays: "",
  isRecommended: false,
  isActive: true,
};

export function PackagesEditor({ serviceId, initialPackages }: Props) {
  const { toast } = useToast();
  const [packages, setPackages] = useState<ServicePackageWithItems[]>(initialPackages ?? []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [pending, startTransition] = useTransition();

  const sortedPackages = useMemo(
    () => [...packages].sort((a, b) => a.sortOrder - b.sortOrder),
    [packages]
  );

  const openNew = () => {
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (pkg: ServicePackageWithItems) => {
    setForm({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price.toString(),
      currency: pkg.currency,
      deliveryDays: pkg.deliveryDays?.toString() ?? "",
      isRecommended: pkg.isRecommended,
      isActive: pkg.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("price", form.price);
    fd.append("currency", form.currency);
    if (form.deliveryDays) fd.append("deliveryDays", form.deliveryDays);
    fd.append("isActive", form.isActive ? "true" : "false");
    fd.append("isRecommended", form.isRecommended ? "true" : "false");

    startTransition(async () => {
      const res = form.id
        ? await updatePackage(form.id, fd)
        : await createPackage(serviceId, fd);
      if (res.ok && res.data) {
        const updated = form.id
          ? packages.map((p) => (p.id === (res.data as any).id ? (res.data as any) : p))
          : [...packages, res.data as any];
        setPackages(updated.sort((a, b) => a.sortOrder - b.sortOrder));
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
        setPackages(packages.map((p) => (p.id === pkgId ? (res.data as any) : p)));
      } else {
        toast({ title: "Toggle failed", description: res.message, variant: "destructive" });
      }
    });
  };

  const handleRecommend = (pkgId: string) => {
    startTransition(async () => {
      const res = await setPackageRecommended(pkgId);
      if (res.ok && res.data) {
        setPackages(res.data as ServicePackageWithItems[]);
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
        setPackages(res.data as ServicePackageWithItems[]);
      } else {
        toast({ title: "Reorder failed", description: res.message, variant: "destructive" });
      }
    });
  };

  const updateItems = (pkgId: string, items: ServicePackageWithItems["items"]) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === pkgId ? { ...p, items: items.slice() } : p))
    );
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">Packages</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage tiers, pricing, and items. One package can be recommended.
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
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold">{pkg.name}</p>
                    {pkg.isRecommended && <Badge>Recommended</Badge>}
                    {!pkg.isActive && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pkg.currency} {pkg.price}{" "}
                    {pkg.deliveryDays ? `· ${pkg.deliveryDays} days` : ""}
                  </p>
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
                  <Button variant="outline" size="sm" onClick={() => handleToggleActive(pkg.id)} disabled={pending}>
                    {pkg.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleRecommend(pkg.id)} disabled={pending}>
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

              <PackageItemsEditor
                packageId={pkg.id}
                initialItems={pkg.items ?? []}
                onItemsChange={(items) => updateItems(pkg.id, items)}
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
              <Label htmlFor="pkg-name">Name</Label>
              <Input
                id="pkg-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                disabled={pending}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr,120px]">
              <div className="space-y-1.5">
                <Label htmlFor="pkg-price">Price</Label>
                <Input
                  id="pkg-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
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
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
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
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Recommended</p>
                <p className="text-xs text-muted-foreground">Only one package will be recommended.</p>
              </div>
              <Switch
                checked={form.isRecommended}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isRecommended: v }))}
                disabled={pending}
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={pending || !form.name || !form.price}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
