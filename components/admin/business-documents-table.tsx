"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

type Doc = {
  id: string;
  title: string;
  category: string;
  storageUrl?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  status?: string | null;
  notes?: string | null;
};

export default function BusinessDocumentsTable({ initialDocuments }: { initialDocuments: Doc[] }) {
  const [documents, setDocuments] = useState<Doc[]>(initialDocuments ?? []);
  const [loading, setLoading] = useState(false);

  const create = async () => {
    const title = window.prompt("Title:");
    if (!title) return;
    const category = window.prompt("Category (Legal, Tax, Amazon, Bank, Other):", "Other") || "Other";
    setLoading(true);
    try {
      const res = await fetch("/api/admin/business/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category }),
      });
      if (!res.ok) throw new Error("Create failed");
      const data = await res.json();
      setDocuments((d) => [data.data, ...d]);
    } catch (err) {
      console.error(err);
      alert("Failed to create document");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      const res = await fetch(`/api/admin/business/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setDocuments((d) => d.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete document");
    }
  };

  const edit = async (doc: Doc) => {
    const title = window.prompt("Title:", doc.title) || doc.title;
    const category = window.prompt("Category:", doc.category) || doc.category;
    try {
      const res = await fetch(`/api/admin/business/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category }),
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      setDocuments((d) => d.map((x) => (x.id === doc.id ? data.data : x)));
    } catch (err) {
      console.error(err);
      alert("Failed to update document");
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <Button onClick={create} disabled={loading}>
          New document
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full table-auto">
          <thead className="bg-muted px-2 text-left text-sm text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Issue</th>
              <th className="px-3 py-2">Expiry</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="px-3 py-2">
                  {d.title}
                </td>
                <td className="px-3 py-2">{d.category}</td>
                <td className="px-3 py-2">{d.issueDate ? new Date(d.issueDate).toLocaleDateString() : "—"}</td>
                <td className="px-3 py-2">{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : "—"}</td>
                <td className="px-3 py-2">{d.status ?? "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    {d.storageUrl && (
                      <Button asChild variant="ghost" size="sm">
                        <a href={d.storageUrl} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => edit(d)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => remove(d.id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
