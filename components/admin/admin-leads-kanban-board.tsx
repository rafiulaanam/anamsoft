"use client";

import { useMemo, useState } from "react";
import type { LeadStatus } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Filter, RefreshCw, Plus } from "lucide-react";

export type LeadSourceType = "ESTIMATE" | "AUDIT" | "MANUAL";

export type KanbanLead = {
  id: string;
  sourceType: LeadSourceType;
  status: LeadStatus;
  name: string;
  email: string;
  salonName?: string | null;
  websiteUrl?: string | null;
  businessType?: string | null;
  mainLabel: string;
  subLabel?: string | null;
  createdAt: Date;
};

interface AdminLeadsKanbanBoardProps {
  leads: KanbanLead[];
}

export function AdminLeadsKanbanBoard({ leads }: AdminLeadsKanbanBoardProps) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<KanbanLead | null>(null);
  const [localLeads, setLocalLeads] = useState<KanbanLead[]>(leads);
  const [manualCards, setManualCards] = useState<KanbanLead[]>([]);
  const [filterSource, setFilterSource] = useState<LeadSourceType | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [dragged, setDragged] = useState<KanbanLead | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<LeadStatus, { title: string; notes: string }>>({
    NEW: { title: "", notes: "" },
    CONTACTED: { title: "", notes: "" },
    CALL_BOOKED: { title: "", notes: "" },
    PROPOSAL_SENT: { title: "", notes: "" },
    WON: { title: "", notes: "" },
    LOST: { title: "", notes: "" },
  });

  const columnsOrder: LeadStatus[] = ["NEW", "CONTACTED", "CALL_BOOKED", "PROPOSAL_SENT", "WON", "LOST"];
  const statusOptions: LeadStatus[] = ["NEW", "CONTACTED", "CALL_BOOKED", "PROPOSAL_SENT", "WON", "LOST"];

  const filteredLeads = useMemo(() => {
    const combined = [...localLeads, ...manualCards];
    return combined.filter((lead) => {
      const matchesSource = filterSource === "ALL" ? true : lead.sourceType === filterSource;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        lead.name.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        (lead.salonName ?? "").toLowerCase().includes(term) ||
        (lead.businessType ?? "").toLowerCase().includes(term);
      return matchesSource && matchesSearch;
    });
  }, [localLeads, manualCards, filterSource, search]);

  const leadsByStatus = useMemo(() => {
    const map: Record<LeadStatus, KanbanLead[]> = {
      NEW: [],
      CONTACTED: [],
      CALL_BOOKED: [],
      PROPOSAL_SENT: [],
      WON: [],
      LOST: [],
    };
    for (const lead of filteredLeads) {
      map[lead.status]?.push(lead);
    }
    return map;
  }, [filteredLeads]);

  const handleStatusChange = async (lead: KanbanLead, nextStatus: LeadStatus) => {
    setStatusUpdatingId(`${lead.sourceType}-${lead.id}`);
    setLocalLeads((prev) =>
      prev.map((l) => (l.id === lead.id && l.sourceType === lead.sourceType ? { ...l, status: nextStatus } : l))
    );
    try {
      const endpoint =
        lead.sourceType === "ESTIMATE"
          ? `/api/admin/project-estimates/${lead.id}`
          : `/api/admin/website-audits/${lead.id}`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast({
        title: "Status updated",
        description: `${lead.name} moved to ${nextStatus.replace(/_/g, " ").toLowerCase()}`,
      });
    } catch (error) {
      console.error(error);
      // revert on error
      setLocalLeads((prev) =>
        prev.map((l) => (l.id === lead.id && l.sourceType === lead.sourceType ? { ...l, status: lead.status } : l))
      );
      toast({ variant: "destructive", title: "Could not update status" });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const resetFilters = () => {
    setFilterSource("ALL");
    setSearch("");
  };

  const handleDrop = (status: LeadStatus) => {
    if (!dragged) return;
    if (dragged.status === status) {
      setDragged(null);
      return;
    }
    handleStatusChange(dragged, status);
    setDragged(null);
  };

  const handleAddManualCard = (status: LeadStatus) => {
    const draft = drafts[status];
    if (!draft.title.trim()) {
      toast({ variant: "destructive", title: "Title required", description: "Add a short title before saving." });
      return;
    }
    const now = new Date();
    const newCard: KanbanLead = {
      id: `manual-${now.getTime()}`,
      sourceType: "MANUAL",
      status,
      name: draft.title.trim(),
      email: "manual@kanban.local",
      mainLabel: draft.title.trim(),
      subLabel: draft.notes.trim() || undefined,
      createdAt: now,
    };
    setManualCards((prev) => [newCard, ...prev]);
    setDrafts((prev) => ({
      ...prev,
      [status]: { title: "", notes: "" },
    }));
    toast({ title: "Card added", description: "Manual card created in the board." });
  };

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 mb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </div>
          <select
            className="h-9 w-[160px] rounded-md border border-slate-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blush-200"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value as LeadSourceType | "ALL")}
          >
            <option value="ALL">All sources</option>
            <option value="ESTIMATE">Estimates</option>
            <option value="AUDIT">Audits</option>
            <option value="MANUAL">Manual</option>
          </select>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, salon..."
            className="h-9 w-full max-w-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Clear
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setLocalLeads(leads)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset board
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:gap-6 overflow-x-auto pb-2">
        {columnsOrder.map((status) => {
          const columnLeads = leadsByStatus[status] ?? [];
          const prettyName = status.toLowerCase().replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

          return (
            <div key={status} className="min-w-[260px] flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">{prettyName}</h2>
                <Badge variant="outline">{columnLeads.length}</Badge>
              </div>
                <div
                  className="space-y-3 rounded-xl border bg-muted/40 p-2 min-h-[120px]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(status)}
                >
                  {columnLeads.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No leads in this stage.</p>
                  )}
                {columnLeads.map((lead) => (
                    <button
                      key={`${lead.sourceType}-${lead.id}`}
                      className="w-full text-left"
                      onClick={() => setSelected(lead)}
                      draggable
                      onDragStart={() => setDragged(lead)}
                      onDragEnd={() => setDragged(null)}
                      onMouseEnter={() => setHoveredId(`${lead.sourceType}-${lead.id}`)}
                      onMouseLeave={() => setHoveredId((prev) =>
                        prev === `${lead.sourceType}-${lead.id}` ? null : prev
                      )}
                    >
                      <Card className="relative rounded-xl border bg-card p-3 shadow-sm hover:border-primary/70 hover:shadow-md transition">
                        {lead.sourceType === "MANUAL" && hoveredId === `${lead.sourceType}-${lead.id}` && (
                          <button
                            type="button"
                            className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50"
                            onClick={(e) => {
                              e.preventDefault();
                              setManualCards((prev) =>
                                prev.filter((c) => !(c.id === lead.id && c.sourceType === lead.sourceType))
                              );
                              setSelected((prev) =>
                                prev && prev.id === lead.id && prev.sourceType === lead.sourceType ? null : prev
                              );
                              toast({ title: "Deleted", description: "Manual card removed from board." });
                            }}
                          >
                            Delete
                          </button>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium">{lead.mainLabel}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {lead.sourceType === "ESTIMATE"
                              ? "Estimate"
                              : lead.sourceType === "AUDIT"
                              ? "Audit"
                              : "Manual"}
                          </Badge>
                        </div>
                        {lead.subLabel && (
                          <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{lead.subLabel}</p>
                        )}
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {lead.name} · {lead.email}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </p>
                      </Card>
                    </button>
                  ))}
                <div className="space-y-2 rounded-lg border border-dashed border-slate-200 bg-white/60 p-3">
                  <div className="text-[11px] font-semibold text-muted-foreground">Add new card</div>
                  <Input
                    placeholder="Title"
                    value={drafts[status].title}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [status]: { ...prev[status], title: e.target.value },
                      }))
                    }
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Notes (optional)"
                    value={drafts[status].notes}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [status]: { ...prev[status], notes: e.target.value },
                      }))
                    }
                    className="h-8 text-xs"
                  />
                  <Button
                    size="sm"
                    className="h-8 w-full text-xs"
                    onClick={() => handleAddManualCard(status)}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead details</DialogTitle>
            <DialogDescription>Combined view for project estimates and website audits.</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">{selected.mainLabel}</p>
                <p className="text-muted-foreground">
                  {selected.name} · {selected.email}
                </p>
                {selected.websiteUrl && (
                  <p className="text-muted-foreground">
                    Website:{" "}
                    <a href={selected.websiteUrl} target="_blank" rel="noreferrer" className="underline">
                      {selected.websiteUrl}
                    </a>
                  </p>
                )}
              </div>

              {selected.businessType && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Business type</p>
                  <p>{selected.businessType}</p>
                </div>
              )}

              {selected.subLabel && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Summary</p>
                  <p>{selected.subLabel}</p>
                </div>
              )}

              <div>
                <p className="text-xs uppercase text-muted-foreground">Source</p>
                <p>{selected.sourceType === "ESTIMATE" ? "Project estimate" : "Website audit"}</p>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
