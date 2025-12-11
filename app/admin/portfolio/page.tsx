"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  imageUrl?: string | null;
  demoUrl?: string | null;
  isDemo: boolean;
}

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [form, setForm] = useState<Partial<PortfolioItem>>({ isDemo: true });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio");
      if (!res.ok) throw new Error("Failed to load portfolio");
      const data = await res.json();
      setItems(data.data ?? []);
    } catch (err: any) {
      setError(err?.message || "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDialog = (item?: PortfolioItem) => {
    setEditing(item ?? null);
    setForm(item ?? { isDemo: true });
    setDialogOpen(true);
    setMessage(null);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.slug || !form.type || !form.description) {
      setMessage("Title, slug, type, and description are required.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        type: form.type,
        description: form.description,
        imageUrl: form.imageUrl ?? null,
        demoUrl: form.demoUrl ?? null,
        isDemo: typeof form.isDemo === "boolean" ? form.isDemo : true,
      };
      const res = await fetch(editing ? `/api/portfolio/${editing.id}` : "/api/portfolio", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Request failed");
      }
      await load();
      setDialogOpen(false);
    } catch (err: any) {
      setMessage(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await load();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Portfolio</h1>
          <p className="text-sm text-slate-600">Manage your beauty & wellness case studies.</p>
        </div>
        <Button onClick={() => openDialog()}>Add portfolio item</Button>
      </div>

      {loading && <p className="text-sm text-slate-600">Loading...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>All portfolio items</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-slate-600">No portfolio items yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Demo?</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.isDemo ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openDialog(item)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit portfolio item" : "Add portfolio item"}</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title ?? ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug ?? ""}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              value={form.type ?? ""}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={form.imageUrl ?? ""}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demoUrl">Demo URL</Label>
            <Input
              id="demoUrl"
              value={form.demoUrl ?? ""}
              onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isDemo"
              checked={!!form.isDemo}
              onChange={(e) => setForm({ ...form, isDemo: e.target.checked })}
            />
            <Label htmlFor="isDemo">Demo item</Label>
          </div>
          {message && <p className="text-sm text-rose-600">{message}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
