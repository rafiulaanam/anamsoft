"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { formatRelativeTime } from "@/lib/lead-utils";
import type { LeadRow } from "@/types/lead";
import type { LeadStatus } from "@prisma/client";
import { Copy, Mail, MessageSquare, Plus, CalendarDays, Edit, X } from "lucide-react";

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

const timelineFilters = ["All", "Calls", "Emails", "Meetings", "Notes", "Tasks"];

function formatDatetime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/80 px-4 py-3 min-w-0">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 min-w-0">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="max-w-[220px] truncate text-right text-slate-700 transition-colors hover:text-slate-900"
          >
            {value}
          </a>
        ) : (
          <span className="max-w-[220px] truncate text-right break-words">{value}</span>
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
    <section className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_15px_45px_-25px_rgba(15,23,42,0.8)] min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export type LeadActionsBarProps = {
  onAddTask: () => void;
  onEmail: () => void;
  onCall: () => void;
  onMeeting: () => void;
  onAddNote: () => void;
};

export function LeadActionsBar({ onAddTask, onEmail, onCall, onMeeting, onAddNote }: LeadActionsBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="default"
        size="sm"
        className="flex items-center gap-2 px-4 font-semibold"
        onClick={onAddTask}
      >
        <Plus className="h-4 w-4" />
        Add task
      </Button>
      <Button variant="ghost" size="sm" onClick={onEmail}>
        <Mail className="h-4 w-4" />
        Email
      </Button>
      <Button variant="ghost" size="sm" onClick={onCall}>
        <MessageSquare className="h-4 w-4" />
        Call
      </Button>
      <Button variant="ghost" size="sm" onClick={onMeeting}>
        <CalendarDays className="h-4 w-4" />
        Meeting
      </Button>
      <Button variant="ghost" size="sm" onClick={onAddNote}>
        <Edit className="h-4 w-4" />
        Add note
      </Button>
      <Button variant="outline" size="sm">
        More
      </Button>
    </div>
  );
}

type LeadDetailDrawerProps = {
  lead: LeadRow;
  open: boolean;
  onClose: () => void;
  onStatusChange: (status: LeadStatus) => void | Promise<void>;
  onAddTask: () => void;
  onEmail: () => void;
  onCall: () => void;
  onMeeting: () => void;
  onAddNote: () => void;
};

export function LeadDetailDrawer({
  lead,
  open,
  onClose,
  onStatusChange,
  onAddTask,
  onEmail,
  onCall,
  onMeeting,
  onAddNote,
}: LeadDetailDrawerProps) {
  const [stage, setStage] = useState<LeadStatus | undefined>(lead.leadStatus);
  const [timelineFilter, setTimelineFilter] = useState("All");
  const { toast } = useToast();

  useEffect(() => {
    setStage(lead.leadStatus);
    setTimelineFilter("All");
  }, [lead.leadStatus]);

  const nextTask = lead.nextFollowUpAt ? formatDatetime(lead.nextFollowUpAt) : "None planned";
  const lastActivity = formatRelativeTime({
    lastActivityAt: lead.lastActivityAt,
    updatedAt: lead.updatedAt,
    createdAt: lead.createdAt,
  });
  const timelineActivities = useMemo(
    () =>
      lead.activities?.filter((activity) => {
        if (timelineFilter === "All") return true;
        const normalized = activity.type.toLowerCase();
        return normalized.includes(timelineFilter.toLowerCase());
      }) ?? [],
    [lead.activities, timelineFilter],
  );
  const qualificationFields = [
    {
      label: "Budget",
      value: lead.budgetRange ?? "Not provided",
    },
    {
      label: "Authority",
      value: lead.decisionMaker ?? "Not provided",
    },
    {
      label: "Need",
      value: lead.serviceInterest ?? lead.message ?? "Not provided",
    },
    {
      label: "Timeline",
      value: lead.targetDeadline ? formatDatetime(lead.targetDeadline) : "Not provided",
    },
  ];

  const isQualified = stage === "QUALIFIED_TO_BUY" || stage === "CONTRACT_SENT";
  const canCreateProposal = isQualified && stage !== "CLOSED_WON";
  const canMarkWon = stage !== "CLOSED_WON";

  const handleCreateProposal = () => toast({ title: "Create proposal", description: "Opening proposal builder…" });
  const handleMarkWon = () => toast({ title: "Mark won", description: "Creating project record…" });

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent className="flex h-[100dvh] max-h-[100dvh] w-full min-w-[320px] flex-col overflow-hidden pb-0 sm:max-w-[92vw] md:max-w-[720px] lg:max-w-[820px] xl:max-w-[900px] 2xl:max-w-[1020px] bg-white shadow-2xl">
        <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="text-xl font-semibold text-slate-900">{lead.fullName}</SheetTitle>
              <p className="text-sm text-slate-500">{lead.company ?? "Independent"}</p>
              <p className="text-xs text-slate-400">Owner: {lead.owner ?? "Unassigned"}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close lead detail">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="min-w-[160px]">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stage</label>
              <select
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={stage ?? "NEW"}
                onChange={(event) => {
                  const next = event.target.value as LeadStatus;
                  setStage(next);
                  onStatusChange(next);
                }}
              >
                {stageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <LeadActionsBar
              onAddTask={onAddTask}
              onEmail={onEmail}
              onCall={onCall}
              onMeeting={onMeeting}
              onAddNote={onAddNote}
            />
          </div>
        </div>
        <ScrollArea className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-6 pt-5">
          <div className="space-y-6">
            <SectionCard title="Next action">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Next task</p>
                  <p className="text-sm font-semibold text-slate-900">{nextTask}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Last touch</p>
                  <p className="text-sm font-semibold text-slate-900">{lastActivity.label}</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Qualification (BANT)">
              <div className="space-y-3">
                {qualificationFields.map((field) => (
                  <InfoRow key={field.label} label={field.label} value={field.value} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Timeline">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {timelineFilters.map((filter) => (
                  <Button
                    key={filter}
                    variant={timelineFilter === filter ? "default" : "outline"}
                    size="sm"
                    className="text-xs uppercase tracking-widest whitespace-nowrap"
                    onClick={() => setTimelineFilter(filter)}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
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

            <SectionCard title="Conversion">
              <div className="space-y-2">
                {canCreateProposal && (
                  <Button size="sm" className="w-full" onClick={handleCreateProposal}>
                    Create proposal / estimate
                  </Button>
                )}
                {canMarkWon && (
                  <Button size="sm" variant="outline" className="w-full" onClick={handleMarkWon}>
                    Mark won → Create project
                  </Button>
                )}
              </div>
            </SectionCard>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
