"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState as useActionState } from "react-dom";
import {
  Archive,
  CalendarClock,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  Trash2,
} from "lucide-react";
import { LeadPriority, LeadStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  archiveLead,
  convertLeadToProject,
  deleteLead,
  updateLead,
  type LeadActionState,
} from "../_actions/leads";

type LeadActivity = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
};

type LeadDetail = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  website?: string | null;
  message: string;
  source?: string | null;
  serviceInterest?: string | null;
  priority: LeadPriority;
  leadStatus: LeadStatus;
  unread: boolean;
  assignedTo?: string | null;
  lastContactedAt?: string | null;
  nextFollowUpAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  activities: LeadActivity[];
};

type Props = {
  lead: LeadDetail;
};

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "ATTEMPTED_TO_CONTACT", label: "Attempted to contact" },
  { value: "CONNECTED", label: "Connected" },
  { value: "OPEN_DEAL", label: "Open deal" },
  { value: "UNQUALIFIED", label: "Unqualified" },
  { value: "BAD_TIMING", label: "Bad timing" },
];

const priorityOptions: { value: LeadPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const conversionAllowedStatuses = ["CONNECTED", "OPEN_DEAL"];

export function LeadDetailView({ lead }: Props) {
  const [updateState, updateAction, updatePending] = useActionState<LeadActionState>(updateLead, { ok: true });
  const [noteState, noteAction, notePending] = useActionState<LeadActionState>(updateLead, { ok: true });
  const [convertState, convertAction, convertPending] = useActionState<LeadActionState<{ projectId: string }>>(
    convertLeadToProject,
    { ok: true }
  );
  const [archiveState, archiveAction, archivePending] = useActionState<LeadActionState>(archiveLead, { ok: true });
  const [deleteState, deleteAction, deletePending] = useActionState<LeadActionState>(deleteLead, { ok: true });

  const [status, setStatus] = useState<LeadStatus>(lead.leadStatus);
  const [priority, setPriority] = useState<LeadPriority>(lead.priority);
  const [assignedTo, setAssignedTo] = useState<string>(lead.assignedTo ?? "");
  const [nextFollowUp, setNextFollowUp] = useState<string>(lead.nextFollowUpAt ? toLocalInput(lead.nextFollowUpAt) : "");
  const [notes, setNotes] = useState<string>(lead.notes ?? "");
  const [unread, setUnread] = useState<boolean>(lead.unread);

  const activityList = useMemo(
    () =>
      [...(lead.activities || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [lead.activities]
  );

  const disabledConvert = !conversionAllowedStatuses.includes(status as string);
  const saving = updatePending || notePending;

  useEffect(() => {
    if (!unread) return;
    const fd = new FormData();
    fd.set("leadId", lead.id);
    fd.set("unread", "false");
    updateAction(fd);
    setUnread(false);
  }, [lead.id, unread, updateAction]);

  useEffect(() => {
    if (notes === (lead.notes ?? "")) return;
    const timer = setTimeout(() => {
      const fd = new FormData();
      fd.set("leadId", lead.id);
      fd.set("notes", notes);
      noteAction(fd);
    }, 700);
    return () => clearTimeout(timer);
  }, [lead.id, lead.notes, notes, noteAction]);

  useEffect(() => {
    if (assignedTo === (lead.assignedTo ?? "")) return;
    if (!assignedTo.length) {
      const fd = new FormData();
      fd.set("leadId", lead.id);
      fd.set("assignedTo", "");
      updateAction(fd);
      return;
    }
    const timer = setTimeout(() => {
      const fd = new FormData();
      fd.set("leadId", lead.id);
      fd.set("assignedTo", assignedTo);
      updateAction(fd);
    }, 500);
    return () => clearTimeout(timer);
  }, [assignedTo, lead.assignedTo, lead.id, updateAction]);

  const submitUpdate = (payload: Record<string, string | boolean | null | undefined>) => {
    const fd = new FormData();
    fd.set("leadId", lead.id);
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      fd.set(key, String(value));
    });
    updateAction(fd);
  };

  const handleFollowPreset = (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    target.setHours(9, 0, 0, 0);
    const localValue = toLocalInput(target.toISOString());
    setNextFollowUp(localValue);
    submitUpdate({ nextFollowUpAt: localValue });
  };

  const handleConvert = () => {
    const fd = new FormData();
    fd.set("leadId", lead.id);
    fd.set("projectName", lead.company || `${lead.fullName} project`);
    const summary =
      lead.message && lead.message.length >= 20
        ? lead.message
        : `${lead.message}\n\nAuto-generated from lead intake.`;
    fd.set("scopeSummary", summary);
    convertAction(fd);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{lead.fullName}</h1>
            {!unread && <Badge variant="secondary">Read</Badge>}
            {unread && <Badge variant="destructive">Unread</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <a className="flex items-center gap-1 text-primary" href={`mailto:${lead.email}`}>
              <Mail className="h-4 w-4" /> {lead.email}
            </a>
            {lead.company && (
              <>
                <span className="text-slate-400">•</span>
                <span>{lead.company}</span>
              </>
            )}
            {lead.website && (
              <>
                <span className="text-slate-400">•</span>
                <a className="flex items-center gap-1 text-primary" href={lead.website} target="_blank" rel="noreferrer">
                  <Globe className="h-4 w-4" /> {new URL(lead.website).hostname}
                </a>
              </>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Created {new Date(lead.createdAt).toLocaleString()} · Updated {new Date(lead.updatedAt).toLocaleString()}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <select
              value={status}
              onChange={(e) => {
                const next = e.target.value as LeadStatus;
                setStatus(next);
                submitUpdate({ leadStatus: next });
              }}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Priority</Label>
            <select
              value={priority}
              onChange={(e) => {
                const next = e.target.value as LeadPriority;
                setPriority(next);
                submitUpdate({ priority: next });
              }}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
            <Switch
              id="mark-read"
              checked={!unread}
              onCheckedChange={(checked) => {
                setUnread(!checked);
                submitUpdate({ unread: !checked });
              }}
            />
            <Label htmlFor="mark-read" className="text-sm">
              Mark as read
            </Label>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-4 md:grid-cols-[2fr,1fr] py-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${lead.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard?.writeText(lead.email)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy email
              </Button>
              {lead.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={lead.website} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open site
                  </a>
                </Button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoField label="Source" value={lead.source ?? "website_form"} />
              <InfoField label="Service interest" value={lead.serviceInterest ?? "Not specified"} />
              <InfoField label="Phone" value={lead.phone ?? "—"} />
              <InfoField
                label="Last contact"
                value={lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleString() : "—"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign to</Label>
              <Input
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Owner or teammate"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <CalendarClock className="h-4 w-4" />
                Follow-up
              </div>
              {nextFollowUp && (
                <Badge variant="outline" className="text-xs">
                  {new Date(nextFollowUp).toLocaleString()}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <Input
                type="datetime-local"
                value={nextFollowUp}
                onChange={(e) => {
                  setNextFollowUp(e.target.value);
                  submitUpdate({ nextFollowUpAt: e.target.value });
                }}
              />
              <div className="flex flex-wrap gap-2">
                {[1, 3, 7].map((days) => (
                  <Button key={days} variant="secondary" size="sm" onClick={() => handleFollowPreset(days)}>
                    +{days === 1 ? "1" : days} day{days > 1 ? "s" : ""}
                  </Button>
                ))}
                {nextFollowUp && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNextFollowUp("");
                      submitUpdate({ nextFollowUpAt: "" });
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{lead.message}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Internal notes</CardTitle>
            <p className="text-sm text-muted-foreground">Auto-saves while you type.</p>
          </div>
          <div className="text-xs text-muted-foreground">
            {notePending ? "Saving..." : noteState?.ok ? "Saved" : noteState?.message || ""}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Add context, next steps, blockers..."
          />
          {noteState?.fieldErrors?.notes && (
            <p className="text-xs text-destructive">{noteState.fieldErrors.notes}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Activity</CardTitle>
          {saving && <span className="text-xs text-muted-foreground">Saving changes...</span>}
        </CardHeader>
        <CardContent className="space-y-4">
          {activityList.length === 0 && (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          )}
          {activityList.map((activity) => (
            <div key={activity.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.type}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(activity.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>{updateState?.message || convertState?.message || archiveState?.message || deleteState?.message}</div>
            {updateState?.fieldErrors && (
              <div className="text-destructive">
                {Object.values(updateState.fieldErrors).join(", ")}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleConvert}
              disabled={convertPending || disabledConvert}
            >
              {convertPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Convert to project
            </Button>
            <form action={archiveAction}>
              <input type="hidden" name="leadId" value={lead.id} />
              <Button variant="outline" size="sm" type="submit" disabled={archivePending}>
                {archivePending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="mr-2 h-4 w-4" />
                )}
                Archive
              </Button>
            </form>
            <form action={deleteAction}>
              <input type="hidden" name="leadId" value={lead.id} />
              <Button variant="destructive" size="sm" type="submit" disabled={deletePending}>
                {deletePending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function toLocalInput(date: string) {
  const d = new Date(date);
  const pad = (val: number) => String(val).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
