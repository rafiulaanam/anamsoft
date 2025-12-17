"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter, RefreshCw, ChevronLeft, ChevronRight, Loader2, Columns } from "lucide-react";
import type { LeadStatus } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";
import { LeadQuickViews } from "@/components/admin/lead-quick-views";
import { LeadDetailDrawer } from "@/components/admin/lead-detail-drawer";
import { LeadAiReplyDialog } from "@/components/admin/lead-ai-reply-dialog";
import { LeadRowActions } from "@/components/admin/lead-row-actions";
import { useLeadsFilters } from "@/hooks/use-leads-filters";
import { formatRelativeTime, getBudgetBadge, getLeadSourceLabel, hasReplyActivity, isOverdueLead } from "@/lib/lead-utils";
import type { LeadRow } from "@/types/lead";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const statusOptions: { label: string; value: LeadStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Appointment scheduled", value: "APPOINTMENT_SCHEDULED" },
  { label: "Qualified to buy", value: "QUALIFIED_TO_BUY" },
  { label: "Contract sent", value: "CONTRACT_SENT" },
  { label: "Closed won", value: "CLOSED_WON" },
  { label: "Closed lost", value: "CLOSED_LOST" },
  { label: "Not a fit", value: "NOT_A_FIT" },
];

function statusBadgeColor(status: LeadStatus) {
  switch (status) {
    case "NEW":
      return "bg-slate-100 text-slate-800";
    case "IN_PROGRESS":
    case "APPOINTMENT_SCHEDULED":
      return "bg-blue-100 text-blue-800";
    case "QUALIFIED_TO_BUY":
      return "bg-emerald-100 text-emerald-800";
    case "CONTRACT_SENT":
      return "bg-amber-100 text-amber-800";
    case "CLOSED_WON":
      return "bg-emerald-100 text-emerald-800";
    case "CLOSED_LOST":
    case "NOT_A_FIT":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

function statusLabel(status: LeadStatus) {
  switch (status) {
    case "NEW":
      return "New";
    case "IN_PROGRESS":
      return "In progress";
    case "APPOINTMENT_SCHEDULED":
      return "Appointment scheduled";
    case "QUALIFIED_TO_BUY":
      return "Qualified to buy";
    case "CONTRACT_SENT":
      return "Contract sent";
    case "CLOSED_WON":
      return "Closed won";
    case "CLOSED_LOST":
      return "Closed lost";
    case "NOT_A_FIT":
      return "Not a fit";
    default:
      return status.replaceAll("_", " ").toLowerCase();
  }
}

interface LeadsTableProps {
  initialLeads: LeadRow[];
  initialStatusFilter?: LeadStatus | "ALL";
  initialUnreadOnly?: boolean;
}

export function LeadsTable({ initialLeads, initialStatusFilter, initialUnreadOnly }: LeadsTableProps) {
  const { toast } = useToast();
  const [leads, setLeads] = useState<LeadRow[]>(initialLeads);
  const {
    filteredLeads,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    unreadOnly,
    setUnreadOnly,
    quickView,
    setQuickView,
    savedFilter,
    toggleSavedFilter,
    clearSavedFilter,
  } = useLeadsFilters(leads, { initialStatusFilter, initialUnreadOnly });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailLead, setDetailLead] = useState<LeadRow | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [aiDialogLead, setAiDialogLead] = useState<LeadRow | null>(null);
  const [creatingTestLead, setCreatingTestLead] = useState(false);
  const [showOwnerColumn, setShowOwnerColumn] = useState(false);
  const [showValueColumn, setShowValueColumn] = useState(false);
  const pageSize = 10;
  const notesTimer = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const totalColumnCount = 7 + Number(showOwnerColumn) + Number(showValueColumn);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads`);
      if (!res.ok) throw new Error("Failed to load leads");
      const data = await res.json();
      setLeads((data.data as LeadRow[]) ?? []);
      setSelected(new Set());
      setCurrentPage(1);
    } catch (err: any) {
      setError(err?.message || "Failed to load leads");
      toast({ title: "Load failed", description: err?.message || "Unable to refresh leads", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || target?.getAttribute("contenteditable") === "true";
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setDetailLead(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenLead = (lead: LeadRow) => {
    setDetailLead(lead);
  };

  const handleDraftReply = (lead: LeadRow) => {
    setAiDialogLead(lead);
  };

  const handleLogActivity = () => {
    toast({ title: "Log activity", description: "Activity logging will be wired soon." });
  };

  const handleEmailAction = () => {
    if (detailLead) handleDraftReply(detailLead);
  };

  const handleCallAction = () => {
    toast({ title: "Call action", description: "Call dialing is not configured yet." });
  };

  const handleAddNoteAction = () => {
    toast({ title: "Add note", description: "Notes flow coming soon." });
  };

  const handleAddTaskAction = () => {
    toast({ title: "Add task", description: "Task builder will appear here soon." });
  };

  const handleReplyLead = (lead: LeadRow) => {
    toast({ title: "Reply flow not connected", description: "We will wire the reply modal soon.", variant: "default" });
    console.info("Reply flow not configured yet for lead", lead.id);
  };

  const handleOpenLeadInNewTab = (lead: LeadRow) => {
    if (typeof window !== "undefined") {
      window.open(`/admin/leads/${lead.id}`, "_blank");
    }
  };

  const closeAiDialog = () => setAiDialogLead(null);

  const bulkUpdate = async (updates: Partial<LeadRow>) => {
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

  const createTestLead = async () => {
    if (creatingTestLead) return;
    setCreatingTestLead(true);
    try {
      const payload = {
        fullName: "Test lead",
        email: "test.lead@example.com",
        company: "Demo salon",
        message: "This is a test lead generated from the admin table.",
      };
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to create test lead");
      }
      toast({ title: "Test lead created", description: "It will appear once the list refreshes." });
      await fetchLeads();
    } catch (err: any) {
      toast({
        title: "Could not create lead",
        description: err?.message || "Added a local placeholder instead.",
        variant: "destructive",
      });
      setLeads((prev) => [
        {
          id: `demo-${Date.now()}`,
          fullName: "Demo lead",
          company: "Demo salon",
          email: "demo@example.com",
          message: "This is a local demo lead.",
          leadStatus: "NEW",
          unread: true,
          priority: "MEDIUM",
          activities: [],
          createdAt: new Date().toISOString(),
          source: "manual",
          owner: null,
        },
        ...prev,
      ]);
    } finally {
      setCreatingTestLead(false);
    }
  };

  const updateStatus = async (id: string, leadStatus: LeadStatus) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadStatus }),
    });
    if (!res.ok) {
      throw new Error("Failed to update status");
    }
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, leadStatus } : lead)));
    return res.json().catch(() => null);
  };

  const handleStatusChange = async (status: LeadStatus) => {
    if (!detailLead) return;
    const originalStatus = detailLead.leadStatus;
    setDetailLead({ ...detailLead, leadStatus: status });
    try {
      await updateStatus(detailLead.id, status);
      toast({ title: "Status updated", description: statusLabel(status) });
    } catch (err: any) {
      setDetailLead((prev) => (prev && prev.id === detailLead.id ? { ...prev, leadStatus: originalStatus } : prev));
      toast({
        title: "Unable to update status",
        description: err?.message || "Try again later.",
        variant: "destructive",
      });
    }
  };

  const saveNotes = async (id: string, notes: string) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    const data = await res.json().catch(() => null);
    const updatedNote = data?.data?.notes ?? notes;
    const updatedAt = data?.data?.updatedAt ?? new Date().toISOString();
    setDetailLead((prev) => (prev && prev.id === id ? { ...prev, notes: updatedNote, updatedAt } : prev));
    await fetchLeads();
  };

  useEffect(() => {
    if (!detailLead) return;
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      setSavingNotes(true);
      setNotesSaved(false);
      await saveNotes(detailLead.id, detailLead.notes ?? "");
      setSavingNotes(false);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 1500);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailLead?.notes, detailLead?.id]);

  useEffect(() => {
    if (!detailLead || !detailLead.unread) return;
    let canceled = false;

    const markOpenLeadAsRead = async () => {
      try {
        await fetch(`/api/leads/${detailLead.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unread: false }),
        });
        if (canceled) return;
        setDetailLead((prev) => (prev && prev.id === detailLead.id ? { ...prev, unread: false } : prev));
        setLeads((prev) => prev.map((l) => (l.id === detailLead.id ? { ...l, unread: false } : l)));
      } catch (err) {
        console.error("Failed to mark lead as read", err);
      }
    };

    markOpenLeadAsRead();

    return () => {
      canceled = true;
    };
  }, [detailLead]);

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<LeadStatus, number>> = {};
    leads.forEach((l) => {
      counts[l.leadStatus] = (counts[l.leadStatus] ?? 0) + 1;
    });
    return counts;
  }, [leads]);

  const handleClearFilters = () => {
    setStatusFilter("ALL");
    setUnreadOnly(false);
    setQuickView("ALL");
    setSearchQuery("");
    clearSavedFilter();
  };

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          className="cursor-pointer transition hover:shadow-md"
          onClick={() => setStatusFilter((prev) => (prev === "NEW" ? "ALL" : "NEW"))}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">New leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{statusCounts.NEW ?? 0}</p>
            <p className="text-xs text-slate-500">Awaiting response</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer transition hover:shadow-md"
          onClick={() => setStatusFilter((prev) => (prev === "IN_PROGRESS" ? "ALL" : "IN_PROGRESS"))}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">In progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">
              {(statusCounts.IN_PROGRESS ?? 0) + (statusCounts.APPOINTMENT_SCHEDULED ?? 0)}
            </p>
            <p className="text-xs text-slate-500">Discovery & scheduling</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer transition hover:shadow-md"
          onClick={() => setStatusFilter((prev) => (prev === "QUALIFIED_TO_BUY" ? "ALL" : "QUALIFIED_TO_BUY"))}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Qualified to buy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{statusCounts.QUALIFIED_TO_BUY ?? 0}</p>
            <p className="text-xs text-slate-500">Ready for pricing</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer transition hover:shadow-md"
          onClick={() => setStatusFilter((prev) => (prev === "NOT_A_FIT" ? "ALL" : "NOT_A_FIT"))}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Not a fit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{statusCounts.NOT_A_FIT ?? 0}</p>
            <p className="text-xs text-slate-500">Closed / disqualified</p>
          </CardContent>
        </Card>
      </div>

      <LeadQuickViews
        quickView={quickView}
        onSelectQuickView={(key) => {
          clearSavedFilter();
          setQuickView(key);
        }}
        savedFilter={savedFilter}
        onApplySavedFilter={toggleSavedFilter}
      />

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
              onChange={(e) => {
                clearSavedFilter();
                setStatusFilter(e.target.value as LeadStatus | "ALL");
              }}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              variant={statusFilter === "NEW" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                clearSavedFilter();
                setStatusFilter((prev) => (prev === "NEW" ? "ALL" : "NEW"));
              }}
            >
              New leads
            </Button>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <Checkbox
                checked={unreadOnly}
                onChange={(e) => {
                  clearSavedFilter();
                  setUnreadOnly(e.target.checked);
                }}
              />
              Unread only
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
            >
              Clear all
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Search leads"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64"
              ref={searchInputRef}
            />
          </div>
        </CardContent>
      </Card>

      {selected.size > 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-wrap items-center gap-3 py-3 text-sm text-slate-700">
            <span className="font-semibold">{selected.size} selected</span>
            <Button variant="outline" size="sm" onClick={() => bulkUpdate({ unread: false })}>
              Mark as read
            </Button>
            <Button variant="outline" size="sm" onClick={() => bulkUpdate({ unread: true })}>
              Mark as unread
            </Button>
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <select
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
                onChange={(e) => {
                  const val = e.target.value as LeadStatus;
                  if (val) bulkUpdate({ leadStatus: val } as Partial<LeadRow>);
                }}
                defaultValue=""
              >
                <option value="">Choose</option>
                {statusOptions.filter((s) => s.value !== "ALL").map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={bulkDelete}>
              Delete selected
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Leads</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-slate-600">
                <Columns className="h-4 w-4" />
                <span>Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Show columns</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={showOwnerColumn} onCheckedChange={(value) => setShowOwnerColumn(Boolean(value))}>
                Owner
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showValueColumn} onCheckedChange={(value) => setShowValueColumn(Boolean(value))}>
                Value
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="overflow-hidden rounded-b-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed text-sm">
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
                  <th className="px-4 py-3 text-left hidden md:table-cell">Source</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell whitespace-nowrap">Last activity</th>
                  {showOwnerColumn && <th className="px-4 py-3 text-left hidden lg:table-cell">Owner</th>}
                  {showValueColumn && (
                    <th className="px-4 py-3 text-right hidden lg:table-cell whitespace-nowrap">Value</th>
                  )}
                  <th className="px-4 py-3 text-right hidden lg:table-cell whitespace-nowrap">Created</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={totalColumnCount} className="px-4 py-6 text-center text-slate-600">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={totalColumnCount} className="px-4 py-6 text-center text-rose-600">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={totalColumnCount} className="px-4 py-8 text-center text-slate-600">
                      <div className="space-y-3 text-center">
                        <p className="text-sm font-semibold text-slate-800">No leads yet</p>
                        <p className="text-sm text-slate-600">
                          Leads from your Contact, Estimate and Audit forms will appear here automatically.
                        </p>
                        <div className="flex justify-center">
                          <Button size="sm" onClick={createTestLead} variant="default" disabled={creatingTestLead}>
                            {creatingTestLead ? "Creating..." : "Create test lead"}
                          </Button>
                        </div>
                        <div className="space-y-2 text-sm text-slate-600">
                          {["Contact form connected", "Estimate funnel active", "Audit page live"].map((item) => (
                            <div key={item} className="flex items-center justify-center gap-2">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">
                                ✓
                              </span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  paginatedLeads.map((lead) => {
                    const lastActivity = formatRelativeTime({
                      lastActivityAt: lead.lastActivityAt,
                      updatedAt: lead.updatedAt,
                      createdAt: lead.createdAt,
                    });
                    const budgetBadge = getBudgetBadge(lead.value ?? lead.score ?? undefined);
                    const isOverdue = isOverdueLead(lead);
                    const hasReply = hasReplyActivity(lead);
                    return (
                      <tr
                        key={lead.id}
                        className={`cursor-pointer transition hover:bg-slate-50 ${selected.has(lead.id) ? "bg-pink-50" : ""} ${
                          lead.unread ? "text-slate-900" : "text-slate-600"
                        }`}
                        onClick={() => handleOpenLead(lead)}
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
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              {lead.unread && <span className="h-2 w-2 rounded-full bg-pink-500" />}
                              <button
                                type="button"
                                className={`text-left text-sm ${lead.unread ? "font-semibold text-slate-900" : "font-medium text-slate-800"} truncate`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleOpenLead(lead);
                                }}
                              >
                                {lead.fullName}
                              </button>
                              {isOverdue && <Badge className="text-[11px]">Overdue</Badge>}
                            </div>
                            {lead.company && <p className="text-xs text-slate-500 truncate">{lead.company}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 hidden md:table-cell truncate">
                          {getLeadSourceLabel(lead.source)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge className={statusBadgeColor(lead.leadStatus)}>{statusLabel(lead.leadStatus)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-700 hidden md:table-cell whitespace-nowrap" title={lastActivity.title}>
                          <span className="text-sm text-slate-600">{lastActivity.label}</span>
                        </td>
                        {showOwnerColumn && (
                          <td className="px-4 py-3 text-slate-700 hidden lg:table-cell truncate">
                            {lead.owner ?? "Unassigned"}
                          </td>
                        )}
                        {showValueColumn && (
                          <td className="px-4 py-3 text-right hidden lg:table-cell whitespace-nowrap">
                            <Badge variant={budgetBadge.variant}>{budgetBadge.label}</Badge>
                          </td>
                        )}
                        <td className="px-4 py-3 text-right hidden lg:table-cell whitespace-nowrap text-slate-500">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <LeadRowActions
                            leadId={lead.id}
                            leadPhone={lead.phone}
                            onOpen={() => handleOpenLead(lead)}
                            onReply={() => handleReplyLead(lead)}
                            showDraft={!hasReply}
                            onDraft={() => handleDraftReply(lead)}
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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

      <LeadDetailDrawer
        lead={detailLead}
        open={!!detailLead}
        onClose={() => setDetailLead(null)}
        onStatusChange={handleStatusChange}
        savingNotes={savingNotes}
        notesSaved={notesSaved}
        onNotesChange={(value) => detailLead && setDetailLead({ ...detailLead, notes: value })}
        onLogActivity={handleLogActivity}
        onEmail={handleEmailAction}
        onCall={handleCallAction}
        onAddNote={handleAddNoteAction}
        onAddTask={handleAddTaskAction}
      />

      <LeadAiReplyDialog lead={aiDialogLead} open={!!aiDialogLead} onClose={closeAiDialog} />
    </section>
  );
}
