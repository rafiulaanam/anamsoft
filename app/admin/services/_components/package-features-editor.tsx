"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  addPackageFeature,
  deletePackageFeature,
  movePackageFeature,
  updatePackageFeature,
} from "../actions";

type Props = {
  packageId: string;
  initialFeatures: string[];
  onFeaturesChange?: (features: string[]) => void;
};

export function PackageFeaturesEditor({ packageId, initialFeatures, onFeaturesChange }: Props) {
  const { toast } = useToast();
  const [features, setFeatures] = useState(initialFeatures ?? []);
  const [newFeature, setNewFeature] = useState("");
  const [pending, startTransition] = useTransition();

  const sync = (next: string[]) => {
    setFeatures(next);
    onFeaturesChange?.(next);
  };

  const handleAdd = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    const prev = features;
    sync([...features, trimmed]);
    setNewFeature("");
    startTransition(async () => {
      const res = await addPackageFeature(packageId, trimmed);
      if (res.ok && Array.isArray(res.data)) {
        sync(res.data);
        toast({ title: res.message || "Feature added" });
      } else {
        sync(prev);
        toast({ title: "Could not add feature", description: res.message, variant: "destructive" });
      }
    });
  };

  const handleUpdate = (index: number, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const prev = features;
    sync(features.map((feature, idx) => (idx === index ? trimmed : feature)));
    startTransition(async () => {
      const res = await updatePackageFeature(packageId, index, trimmed);
      if (res.ok && Array.isArray(res.data)) {
        sync(res.data);
        toast({ title: res.message || "Feature updated" });
      } else {
        sync(prev);
        toast({ title: "Could not update feature", description: res.message, variant: "destructive" });
      }
    });
  };

  const handleDelete = (index: number) => {
    const prev = features;
    sync(features.filter((_, idx) => idx !== index));
    startTransition(async () => {
      const res = await deletePackageFeature(packageId, index);
      if (res.ok && Array.isArray(res.data)) {
        sync(res.data);
        toast({ title: res.message || "Feature deleted" });
      } else {
        sync(prev);
        toast({ title: "Could not delete feature", description: res.message, variant: "destructive" });
      }
    });
  };

  const handleMove = (index: number, dir: "up" | "down") => {
    startTransition(async () => {
      const res = await movePackageFeature(packageId, index, dir);
      if (res.ok && Array.isArray(res.data)) {
        sync(res.data);
        toast({ title: res.message || "Feature reordered" });
      } else {
        toast({ title: "Could not reorder feature", description: res.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add feature"
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          disabled={pending}
        />
        <Button type="button" onClick={handleAdd} disabled={pending || !newFeature.trim()}>
          Add
        </Button>
      </div>
      {features.length === 0 ? (
        <p className="text-xs text-muted-foreground">No features yet.</p>
      ) : (
        <div className="space-y-2">
          {features.map((feature, idx) => (
            <div
              key={`${idx}-${feature}`}
              className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <Input
                value={feature}
                onChange={(e) => handleUpdate(idx, e.target.value)}
                disabled={pending}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMove(idx, "up")}
                  disabled={pending || idx === 0}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMove(idx, "down")}
                  disabled={pending || idx === features.length - 1}
                >
                  Down
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(idx)}
                  disabled={pending}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
