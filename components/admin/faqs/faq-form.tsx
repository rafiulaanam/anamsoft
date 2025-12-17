"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export type FaqFormValues = {
  id?: string;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
};

interface FaqFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: FaqFormValues;
  onSave: (values: Omit<FaqFormValues, "id"> & { id?: string }) => Promise<void>;
  isSaving: boolean;
}

export function FaqForm({ open, onOpenChange, initialValues, onSave, isSaving }: FaqFormProps) {
  const [values, setValues] = useState<FaqFormValues>({
    question: "",
    answer: "",
    sortOrder: 0,
    isPublished: true,
  });

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
    } else {
      setValues({
        question: "",
        answer: "",
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
          <SheetTitle>{values.id ? "Edit FAQ" : "Add FAQ"}</SheetTitle>
          <SheetDescription>
            Manage the question, answer, and visibility for the public FAQ section.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              value={values.question}
              onChange={(event) => setValues({ ...values, question: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Answer</Label>
            <Textarea
              rows={4}
              value={values.answer}
              onChange={(event) => setValues({ ...values, answer: event.target.value })}
            />
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
              {isSaving ? "Saving…" : "Save FAQ"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
