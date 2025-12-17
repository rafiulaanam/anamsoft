"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { TestimonialToolbar } from "@/components/admin/testimonials/testimonial-toolbar";
import { TestimonialForm, TestimonialFormValues } from "@/components/admin/testimonials/testimonial-form";

type TestimonialRow = {
  id: string;
  name: string;
  subtitle?: string | null;
  quote: string;
  rating?: number | null;
  sortOrder: number;
  isPublished: boolean;
  updatedAt: string;
};

const EMPTY_STATE = (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-muted/60 p-8 text-center text-sm text-slate-600">
    No testimonials yet. Add a new quote to highlight on the landing page.
  </div>
);

export default function AdminTestimonialsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [sort, setSort] = useState<"sortOrder" | "updatedAt">("sortOrder");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [data, setData] = useState<{
    items: TestimonialRow[];
    total: number;
    page: number;
    pageSize: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formValues, setFormValues] = useState<TestimonialFormValues | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        filter,
        sort,
        direction,
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      const res = await fetch(`/api/admin/testimonials?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load testimonials");
      const body = await res.json();
      setData({
        items: body.data.items,
        total: body.data.total,
        page: body.data.page,
        pageSize: body.data.pageSize,
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to load testimonials", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [search, filter, sort, direction, page, pageSize, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openForm = (testimonial?: TestimonialRow) => {
    setFormValues(testimonial ? { ...testimonial } : undefined);
    setSheetOpen(true);
  };

  const handleSave = async (values: Omit<TestimonialFormValues, "id"> & { id?: string }) => {
    setIsSaving(true);
    try {
      const method = values.id ? "PATCH" : "POST";
      const url = values.id ? `/api/admin/testimonials/${values.id}` : "/api/admin/testimonials";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: "Testimonial saved" });
      setSheetOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (row: TestimonialRow) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/testimonials/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: !row.isPublished }),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast({ title: "Visibility updated" });
        fetchData();
      } catch (error) {
        console.error(error);
        toast({ title: "Update failed", variant: "destructive" });
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast({ title: "Testimonial deleted" });
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const moveOrder = async (row: TestimonialRow, delta: number) => {
    const nextOrder = row.sortOrder + delta;
    try {
      const res = await fetch(`/api/admin/testimonials/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: nextOrder }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      toast({ title: "Order updated" });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Order update failed", variant: "destructive" });
    }
  };

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.pageSize));
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-slate-600">Testimonials</p>
        <h1 className="text-3xl font-semibold text-slate-900">Premium Testimonial management</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Curate the testimonials shown on the landing page with search, filters, and quick actions.
        </p>
      </div>

      <Card className="space-y-5 p-6">
        <CardHeader>
          <CardTitle>Testimonial list</CardTitle>
        </CardHeader>
        <TestimonialToolbar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          sort={sort}
          onSortChange={setSort}
          direction={direction}
          onDirectionChange={setDirection}
          onAdd={() => openForm()}
        />
        <div className="h-px w-full bg-slate-200" />
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="h-16 rounded-2xl border border-dashed border-slate-200 bg-slate-100/60" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          EMPTY_STATE
        ) : (
          <div className="overflow-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subtitle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.subtitle ?? "—"}</TableCell>
                    <TableCell>
                      <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {row.isPublished ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell>{row.rating ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => moveOrder(row, -1)}>
                          Up
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => moveOrder(row, 1)}>
                          Down
                        </Button>
                        <span className="text-xs text-muted-foreground">{row.sortOrder}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(row.updatedAt).toLocaleString()}</TableCell>
                    <TableCell className="flex flex-wrap items-center justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openForm(row)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(row)}>
                        Delete
                      </Button>
                      <Switch checked={row.isPublished} onCheckedChange={() => handleToggle(row)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {data && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing page {data.page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <TestimonialForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialValues={formValues}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogHeader>
          <DialogTitle>Delete testimonial</DialogTitle>
          <DialogDescription>
            Deleting removes the quote from the landing page. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Confirm to delete the testimonial permanently.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button className="text-sm" variant="destructive" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? "Deleting…" : "Confirm delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
