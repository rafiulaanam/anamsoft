"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  name: string;
  salonName: string;
  website?: string | null;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to load leads");
      const data = await res.json();
      setLeads(data.data ?? []);
    } catch (err: any) {
      setError(err?.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleRead = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !current }),
      });
      if (!res.ok) throw new Error("Update failed");
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to update lead");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
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
          <h1 className="text-2xl font-semibold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-600">View and manage incoming leads.</p>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-600">Loading...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>All leads</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="text-sm text-slate-600">No leads yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Salon</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className={!lead.isRead ? "bg-blush-50/60" : undefined}>
                    <TableCell className={!lead.isRead ? "font-semibold" : undefined}>{lead.name}</TableCell>
                    <TableCell>{lead.salonName}</TableCell>
                    <TableCell className="max-w-[160px] truncate">{lead.website || "-"}</TableCell>
                    <TableCell className="max-w-[220px] truncate" title={lead.message}>
                      {lead.message}
                    </TableCell>
                    <TableCell>{new Date(lead.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={lead.isRead ? "bg-slate-200 text-slate-700" : "bg-blush-100 text-blush-700"}>
                        {lead.isRead ? "Read" : "Unread"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => toggleRead(lead.id, lead.isRead)}>
                        {lead.isRead ? "Mark unread" : "Mark read"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(lead.id)}>
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
    </div>
  );
}
