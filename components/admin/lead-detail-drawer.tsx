"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Mail, MessageSquare, Plus, X } from "lucide-react";
import { formatRelativeTime, getLeadSourceLabel } from "@/lib/lead-utils";
import type { LeadRow } from "@/types/lead";
import type { LeadStatus } from "@prisma/client";

const stageOptions: { label: string; value: LeadStatus }[] = [
  { label: "New", value: "NEW" },
  { label: "Open", value: "OPEN" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Attempted to contact", value: "ATTEMPTED_TO_CONTACT" },
  { label: "Connected", value: "CONNECTED" },
  { label: "Appointment scheduled", value: "APPOINTMENT_SCHEDULED" },
  { label: "Qualified to buy", value: "QUALIFIED_TO_BUY" },
  { label: "Contract sent", value: "CONTRACT_SENT" },
  { label: "Closed won", value: "CLOSED_WON" },
  { label: "Closed lost", value: "CLOSED_LOST" },
  { label: "Not a fit", value: "NOT_A_FIT" },
];

const timelineFilters = ["All", "Calls", "Emails", "Notes", "Tasks"];

function formatDatetime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: LeadStatus) {
  return stageOptions.find((stage) => stage.value === status)?.label ?? status.replaceAll("_", " ");
}

function safeHostname(url?: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

type InfoRowProps = {
  label: string;
  value?: string | null;
  subtitle?: string;
  link?: string;
  copyValue?: string;
};

function InfoRow({ label, value, subtitle, link, copyValue }: InfoRowProps) {
  if (!value && !subtitle) return null;
  const handleCopy = () => {
    if (!copyValue) return;
    navigator.clipboard?.writeText(copyValue);
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/80 px-4 py-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="max-w-[180px] truncate text-right text-slate-700 transition-colors hover:text-slate-900"
          >
            {value}
          </a>
        ) : (
          <span className="max-w-[180px] truncate text-right">{value}</span>
        )}
        {copyValue && (
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-800" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

type SectionCardProps = {
  title: string;
  children: ReactNode;
};

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

type LeadActionsBarProps = {
  onLogActivity: () => void;
  onEmail: () => void;
  onCall: () => void;
  onAddNote: () => void;
  onAddTask: () => void;
};

function LeadActionsBar({ onLogActivity, onEmail, onCall, onAddNote, onAddTask }: LeadActionsBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="default"
        size="sm"
        className="flex items-center gap-2 px-4 font-semibold"
        onClick={onLogActivity}
      >
        <Plus className="h-4 w-4" />
        Log activity
      </Button>
      <Button variant="ghost" size="sm" onClick={onEmail}>
        <Mail className="h-4 w-4" />
        Email
      </Button>
      <Button variant="ghost" size="sm" onClick={onCall}>
        <MessageSquare className="h-4 w-4" />
        Call
      </Button>
      <Button variant="ghost" size="sm" onClick={onAddNote}>
        Add note
      </Button>
      <Button variant="ghost" size="sm" onClick={onAddTask}>
        Add task
      </Button>
      <Button variant="outline" size="sm">
        …
      </Button>
    </div>
  );
}

type LeadDetailDrawerProps = {
  lead: LeadRow | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (status: LeadStatus) => void | Promise<void>;
  savingNotes: boolean;
  notesSaved: boolean;
  onNotesChange: (value: string) => void;
  onLogActivity: () => void;
  onEmail: () => void;
  onCall: () => void;
  onAddNote: () => void;
  onAddTask: () => void;
};

export function LeadDetailDrawer({
  lead,
  open,
  onClose,
  onStatusChange,
  savingNotes,
  notesSaved,
  onNotesChange,
  onLogActivity,
  onEmail,
  onCall,
  onAddNote,
  onAddTask,
}: LeadDetailDrawerProps) {
  const [selectedStage, setSelectedStage] = useState<LeadStatus | undefined>(lead?.leadStatus);
  const [timelineFilter, setTimelineFilter] = useState("All");

  useEffect(() => {
    setSelectedStage(lead.leadStatus);
    setTimelineFilter("All");
  }, [lead.leadStatus]);

  if (!lead) return null;

  const websiteLabel = safeHostname(lead.website);
  const sourceLabel = getLeadSourceLabel(lead.source);
  const lastActivity = formatRelativeTime({
    lastActivityAt: lead.lastActivityAt,
    updatedAt: lead.updatedAt,
    createdAt: lead.createdAt,
  });
  const nextTask = lead.nextFollowUpAt ? formatDatetime(lead.nextFollowUpAt) : "None planned";
  const timelineActivities = useMemo(
    () =>
      lead.activities?.filter((activity) => {
        if (timelineFilter === "All") return true;
        const normalized = activity.type.toLowerCase();
        return normalized.includes(timelineFilter.toLowerCase());
      }) ?? [],
    [lead.activities, timelineFilter],
  );

  const detailsRows = [
    { label: "Email", value: lead.email, link: lead.email ? `mailto:${lead.email}` : undefined },
    { label: "Phone", value: lead.phone, link: lead.phone ? `tel:${lead.phone}` : undefined },
    { label: "Website", value: websiteLabel, link: lead.website ?? undefined },
    { label: "Company", value: lead.company },
    { label: "Priority", value: lead.priority ? lead.priority.toLowerCase() : undefined },
    { label: "Decision maker", value: lead.decisionMaker },
    { label: "Source", value: sourceLabel },
    { label: "Created", value: formatDatetime(lead.createdAt) },
    { label: "Last updated", value: formatDatetime(lead.updatedAt) },
  ];

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-white">
        <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="text-xl font-semibold text-slate-900">{lead.fullName}</SheetTitle>
              <p className="text-sm text-slate-500">
                {lead.company ?? "Independent"} • Owner
              </p>
              <p className="text-xs text-slate-400">{lead.owner ?? "Unassigned"}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close lead detail">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4">
            <LeadActionsBar
              onLogActivity={onLogActivity}
              onEmail={onEmail}
              onCall={onCall}
              onAddNote={onAddNote}
              onAddTask={onAddTask}
            />
          </div>
        </div>
        <div className="sticky top-[128px] z-20 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Next task</p>
              <p className="text-sm font-semibold text-slate-900">{nextTask}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Last touch</p>
              <p className="text-sm font-semibold text-slate-900">{lastActivity.label}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Stage</p>
              <select
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={selectedStage ?? lead.leadStatus}
                onChange={(event) => {
                  const stage = event.target.value as LeadStatus;
                  setSelectedStage(stage);
                  onStatusChange(stage);
                }}
              >
                {stageOptions.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1 px-4 pb-6 pt-4">
          <div className="space-y-6">
            <Tabs defaultValue="timeline">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="forms">Form answers</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {timelineFilters.map((filter) => (
                      <Button
                        key={filter}
                        variant={timelineFilter === filter ? "default" : "outline"}
                        size="sm"
                        className="text-xs uppercase tracking-widest"
                        onClick={() => setTimelineFilter(filter)}
                      >
                        {filter}
                      </Button>
                    ))}
                  </div>
                  <SectionCard title="Timeline">
                    <div className="space-y-3">
                      {timelineActivities.length === 0 ? (
                        <p className="text-sm text-slate-500">No activity yet.</p>
                      ) : (
                        timelineActivities.map((activity) => (
                          <div key={activity.id} className="space-y-1 rounded-xl bg-slate-50/80 p-3">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>{activity.type.replaceAll("_", " ")}</span>
                              <span>{formatDatetime(activity.createdAt)}</span>
                            </div>
                            <p className="text-sm text-slate-700">{activity.message ?? "View activity"}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </SectionCard>
                </div>
              </TabsContent>
              <TabsContent value="details">
                <SectionCard title="Details">
                  <div className="grid gap-3 lg:grid-cols-2">
                    {detailsRows.map((row) => (
                      <InfoRow key={row.label} label={row.label} value={row.value} link={row.link} subtitle={row.subtitle} />
                    ))}
                  </div>
                </SectionCard>
                <SectionCard title="More details">
                  <div className="grid gap-3 lg:grid-cols-2">
                    <InfoRow label="Owner" value={lead.owner ?? "Unassigned"} />
                    <InfoRow label="Stage" value={statusLabel(selectedStage ?? lead.leadStatus)} />
                    <InfoRow label="Priority" value={lead.priority ? lead.priority.toLowerCase() : undefined} />
                    <InfoRow label="Source" value={sourceLabel} />
                  </div>
                </SectionCard>
              </TabsContent>
              <TabsContent value="forms">
                <SectionCard title="Form answers">
                  {lead.serviceInterest && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Service interest</p>
                      <p className="text-sm text-slate-700">{lead.serviceInterest}</p>
                    </div>
                  )}
                  <p className="text-sm text-slate-500">Advanced answers appear here.</p>
                </SectionCard>
              </TabsContent>
              <TabsContent value="files">
                <SectionCard title="Files">
                  <p className="text-sm text-slate-500">Link or upload files related to this lead.</p>
                </SectionCard>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
