"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export type TestimonialFormValues = {
  id?: string;
  name: string;
  subtitle?: string | null;
  quote: string;
  avatarUrl?: string | null;
  rating?: number | null;
  sortOrder: number;
  isPublished: boolean;
};

interface TestimonialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: TestimonialFormValues;
  onSave: (values: Omit<TestimonialFormValues, "id"> & { id?: string }) => Promise<void>;
  isSaving: boolean;
}

export function TestimonialForm({ open, onOpenChange, initialValues, onSave, isSaving }: TestimonialFormProps) {
  const [values, setValues] = useState<TestimonialFormValues>({
    name: "",
    subtitle: "",
    quote: "",
    avatarUrl: "",
    rating: 5,
    sortOrder: 0,
    isPublished: true,
  });

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
    } else {
      setValues({
        name: "",
        subtitle: "",
        quote: "",
        avatarUrl: "",
        rating: 5,
        sortOrder: 0,
        isPublished: true,
      });
    }
  }, [initialValues, open]);

  const handleSave = async () => {
    await onSave(values);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent>
        <SheetHeader>
          <SheetTitle>{values.id ? "Edit testimonial" : "Add testimonial"}</SheetTitle>
          <SheetDescription>
            Share a new quote, rating, and metadata that appear on the landing page.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input
              value={values.subtitle ?? ""}
              onChange={(event) => setValues({ ...values, subtitle: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Quote</Label>
            <Textarea
              rows={4}
              value={values.quote}
              onChange={(event) => setValues({ ...values, quote: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Avatar URL</Label>
            <Input
              value={values.avatarUrl ?? ""}
              onChange={(event) => setValues({ ...values, avatarUrl: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Rating (1-5)</Label>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={values.rating ?? 5}
              onChange={(event) => setValues({ ...values, rating: Number(event.target.value) })}
              className="w-full accent-primary"
            />
            <p className="text-xs text-muted-foreground">Current rating: {values.rating ?? 0}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={values.sortOrder}
                onChange={(event) =>
                  setValues({ ...values, sortOrder: Number(event.target.value) })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Published</Label>
              <Switch
                checked={values.isPublished}
                onCheckedChange={(checked) => setValues({ ...values, isPublished: checked })}
              />
            </div>
          </div>
        </div>
        <SheetFooter>
          <div className="flex w-full justify-end gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save testimonial"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
