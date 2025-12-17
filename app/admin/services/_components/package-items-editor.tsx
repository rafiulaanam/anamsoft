"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  createPackageItem,
  deletePackageItem,
  movePackageItem,
  updatePackageItem,
} from "../actions";

type Item = {
  id: string;
  packageId: string;
  text: string;
  sortOrder: number;
};

type Props = {
  packageId: string;
  initialItems: Item[];
  onItemsChange?: (items: Item[]) => void;
};

export function PackageItemsEditor({ packageId, initialItems, onItemsChange }: Props) {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>(initialItems ?? []);
  const [newText, setNewText] = useState("");
  const [pending, startTransition] = useTransition();

  const sync = (next: Item[]) => {
    setItems(next);
    onItemsChange?.(next);
  };

  const handleAdd = () => {
    if (!newText.trim()) return;
    const optimistic: Item = {
      id: `temp-${Date.now()}`,
      packageId,
      text: newText,
      sortOrder: items.length + 1,
    };
    sync([...items, optimistic]);
    setNewText("");
    startTransition(async () => {
      const res = await createPackageItem(packageId, optimistic.text);
      if (res.ok && res.data) {
        const created = res.data as Item;
        const next = [...items.filter((i) => !i.id.startsWith("temp-")), created];
        sync(next.sort((a, b) => a.sortOrder - b.sortOrder));
        toast({ title: "Item added" });
      } else {
        sync(items);
        toast({ title: "Could not add item", description: res.message, variant: "destructive" });
      }
    });
  };

  const handleUpdate = (itemId: string, text: string) => {
    sync(items.map((i) => (i.id === itemId ? { ...i, text } : i)));
    startTransition(async () => {
      const res = await updatePackageItem(itemId, text);
      if (!res.ok) {
        toast({ title: "Update failed", description: res.message, variant: "destructive" });
      } else {
        toast({ title: "Item updated" });
      }
    });
  };

  const handleDelete = (itemId: string) => {
    const prev = items;
    sync(items.filter((i) => i.id !== itemId));
    startTransition(async () => {
      const res = await deletePackageItem(itemId);
      if (!res.ok) {
        sync(prev);
        toast({ title: "Delete failed", description: res.message, variant: "destructive" });
      } else {
        toast({ title: "Item deleted" });
      }
    });
  };

  const handleMove = (itemId: string, dir: "up" | "down") => {
    startTransition(async () => {
      const res = await movePackageItem(itemId, dir);
      if (res.ok && Array.isArray(res.data)) {
        const sorted = [...(res.data as Item[])].sort((a, b) => a.sortOrder - b.sortOrder);
        sync(sorted);
      } else {
        toast({ title: "Reorder failed", description: res.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add item"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          disabled={pending}
        />
        <Button type="button" onClick={handleAdd} disabled={pending || !newText.trim()}>
          Add
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No items yet.</p>
      ) : (
        <div className="space-y-2">
          {items
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((item, idx) => (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                )}
              >
                <Input
                  value={item.text}
                  onChange={(e) => handleUpdate(item.id, e.target.value)}
                  disabled={pending}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleMove(item.id, "up")}
                    disabled={pending || idx === 0}
                  >
                    Up
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleMove(item.id, "down")}
                    disabled={pending || idx === items.length - 1}
                  >
                    Down
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
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
