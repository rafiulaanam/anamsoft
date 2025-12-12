"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Trash,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LeadStatus } from "@prisma/client";

interface Lead {
  id: string;
  name: string;
  salonName: string;
  email: string;
  website?: string | null;
  message: string;
  status: LeadStatus;
  isRead: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const statusOptions: { label: string; value: LeadStatus | "ALL"; color: string }[] = [
  { label: "All", value: "ALL", color: "bg-slate-200" },
  { label: "New", value: "NEW", color: "bg-slate-300" },
  { label: "Contacted", value: "CONTACTED", color: "bg-blue-200" },
  { label: "Call booked", value: "CALL_BOOKED", color: "bg-purple-200" },
  { label: "Proposal sent", value: "PROPOSAL_SENT", color: "bg-amber-200" },
  { label: "Won", value: "WON", color: "bg-emerald-200" },
  { label: "Lost", value: "LOST", color: "bg-rose-200" },
];

function statusBadgeColor(status: LeadStatus) {
  switch (status) {
    case "NEW":
      return "bg-slate-100 text-slate-800";
    case "CONTACTED":
      return "bg-blue-100 text-blue-800";
    case "CALL_BOOKED":
      return "bg-purple-100 text-purple-800";
    case "PROPOSAL_SENT":
      return "bg-amber-100 text-amber-800";
    case "WON":
      return "bg-emerald-100 text-emerald-800";
    case "LOST":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

function statusLabel(status: LeadStatus) {
  switch (status) {
    case "NEW":
      return "New";
    case "CONTACTED":
      return "Contacted";
    case "CALL_BOOKED":
      return "Call booked";
    case "PROPOSAL_SENT":
      return "Proposal sent";
    case "WON":
      return "Won";
    case "LOST":
      return "Lost";
    default:
      return status;
  }
}

interface LeadsTableProps {
  initialLeads: Lead[];
}

export function LeadsTable({ initialLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (unreadOnly) params.set("isRead", "false");
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/leads?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load leads");
      const data = await res.json();
      setLeads(data.data ?? []);
      setSelected(new Set());
      setCurrentPage(1);
    } catch (err: any) {
      setError(err?.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, unreadOnly]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return leads.slice(start, start + pageSize);
  }, [leads, currentPage]);

  const totalPages = Math.max(1, Math.ceil(leads.length / pageSize));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkUpdate = async (updates: Partial<Lead>) => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/leads/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
      )
    );
    await fetchLeads();
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    await Promise.all(ids.map((id) => fetch(`/api/leads/${id}`, { method: "DELETE" })));
    await fetchLeads();
  };

  const markRead = async (id: string, isRead: boolean) => {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead }),
    });
    await fetchLeads();
  };

  const updateStatus = async (id: string, status: LeadStatus) => {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchLeads();
  };

  const saveNotes = async (id: string, notes: string) => {
    setSavingNotes(true);
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSavingNotes(false);
    await fetchLeads();
  };

  const statusCounts = useMemo(() => {
    const counts: Record<LeadStatus, number> = {
      NEW: 0,
      CONTACTED: 0,
      CALL_BOOKED: 0,
      PROPOSAL_SENT: 0,
      WON: 0,
      LOST: 0,
    } as Record<LeadStatus, number>;
    leads.forEach((l) => {
      counts[l.status] = (counts[l.status] || 0) + 1;
    });
    return counts;
  }, [leads]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-600">Manage incoming leads and track progress.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">New leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{statusCounts.NEW ?? 0}</p>
            <p className="text-xs text-slate-500">Awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">In progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">
              {(statusCounts.CONTACTED ?? 0) + (statusCounts.CALL_BOOKED ?? 0) + (statusCounts.PROPOSAL_SENT ?? 0)}
            </p>
            <p className="text-xs text-slate-500">Contacted / Calls / Proposals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Won</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{statusCounts.WON ?? 0}</p>
            <p className="text-xs text-slate-500">Closed deals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Total leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{leads.length}</p>
            <p className="text-xs text-slate-500">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between py-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-slate-700 text-sm">
              <Filter className="h-4 w-4" />
              <span>Status</span>
            </div>
            <select
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "ALL")}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <Checkbox checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
              Unread only
            </label>
            <Button variant="ghost" size="sm" onClick={() => { setStatusFilter("ALL"); setUnreadOnly(false); setSearch(""); fetchLeads(); }}>
              Reset filters
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Search leads"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64"
            />
            <Button variant="outline" size="sm" onClick={fetchLeads}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-wrap items-center gap-3 py-3 text-sm text-slate-700">
            <span className="font-semibold">{selected.size} selected</span>
            <Button variant="outline" size="sm" onClick={() => bulkUpdate({ isRead: true })}>Mark as read</Button>
            <Button variant="outline" size="sm" onClick={() => bulkUpdate({ isRead: false })}>Mark as unread</Button>
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <select
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
                onChange={(e) => {
                  const val = e.target.value as LeadStatus;
                  if (val) bulkUpdate({ status: val });
                }}
                defaultValue=""
              >
                <option value="">Choose</option>
                {statusOptions.filter((s) => s.value !== "ALL").map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={bulkDelete}>Delete selected</Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-100 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={selected.size > 0 && selected.size === paginatedLeads.length}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const ids = paginatedLeads.map((l) => l.id);
                    setSelected((prev) => {
                      const next = new Set(prev);
                      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
                      return next;
                    });
                  }}
                />
              </th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Salon</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-rose-600">{error}</td>
              </tr>
            )}
            {!loading && !error && paginatedLeads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-600">No leads found.</td>
              </tr>
            )}
            {!loading && !error && paginatedLeads.map((lead) => (
              <tr
                key={lead.id}
                className={`hover:bg-slate-50 cursor-pointer ${lead.isRead ? "text-slate-600" : "text-slate-900"}`}
                onClick={() => setDetailLead(lead)}
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selected.has(lead.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(lead.id);
                    }}
                  />
                </td>
                <td className="px-4 py-3 font-semibold truncate">
                  <span className={!lead.isRead ? "font-semibold" : "font-medium"}>{lead.name}</span>
                </td>
                <td className="px-4 py-3 text-slate-700 truncate">{lead.salonName}</td>
                <td className="px-4 py-3 text-slate-700 truncate">{lead.email}</td>
                <td className="px-4 py-3">
                  <Badge className={statusBadgeColor(lead.status)}>{statusLabel(lead.status)}</Badge>
                </td>
                <td className="px-4 py-3 text-right text-slate-500">
                  {formatDate(lead.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-700">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detail drawer */}
      <Sheet open={!!detailLead} onOpenChange={(open) => !open && setDetailLead(null)}>
        {detailLead && (
          <SheetContent className="w-full max-w-xl" aria-label="Lead detail">
              <SheetHeader className="space-y-1">
                <SheetTitle className="text-xl">{detailLead.name}</SheetTitle>
                <p className="text-sm text-slate-600">{detailLead.salonName}</p>
                <p className="text-xs text-slate-500">
                  {new Date(detailLead.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">Status</p>
                <select
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={detailLead.status}
                  onChange={async (e) => {
                    const val = e.target.value as LeadStatus;
                    await updateStatus(detailLead.id, val);
                    setDetailLead({ ...detailLead, status: val });
                  }}
                >
                  {statusOptions.filter((s) => s.value !== "ALL").map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <Checkbox
                    checked={detailLead.isRead}
                    onChange={async (e) => {
                      await markRead(detailLead.id, e.target.checked);
                      setDetailLead({ ...detailLead, isRead: e.target.checked });
                    }}
                  />
                  Mark as read
                </label>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">Contact info</p>
                <div className="text-sm text-slate-700 space-y-1">
                  <p>
                    Email: <a className="text-blush-700" href={`mailto:${detailLead.email}`}>{detailLead.email}</a>
                  </p>
                  {detailLead.website && (
                    <p>
                      Website: <a className="text-blush-700" href={detailLead.website} target="_blank" rel="noreferrer">{detailLead.website}</a>
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">Message</p>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-line max-h-40 overflow-auto">
                  {detailLead.message}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">Internal notes</p>
                <Textarea
                  value={detailLead.notes ?? ""}
                  onChange={(e) => setDetailLead({ ...detailLead, notes: e.target.value })}
                  rows={4}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={savingNotes}
                  onClick={async () => {
                    await saveNotes(detailLead.id, detailLead.notes ?? "");
                  }}
                >
                  {savingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save notes"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const next = !detailLead.isRead;
                    await markRead(detailLead.id, next);
                    setDetailLead({ ...detailLead, isRead: next });
                  }}
                >
                  {detailLead.isRead ? "Mark as unread" : "Mark as read"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await fetch(`/api/leads/${detailLead.id}`, { method: "DELETE" });
                    setDetailLead(null);
                    await fetchLeads();
                  }}
                >
                  Delete lead
                </Button>
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </section>
  );
}
