"use client";

import { useState } from "react";
import { useFormState as useActionState } from "react-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveQualification, type ActionResult } from "../_actions/qualification";

type Props = {
  leadId: string;
  notes?: string | null;
  isRead: boolean;
  leadScore?: number | null;
  scoreReasons?: string[] | null;
};

const budgetRanges = [
  { value: "UNKNOWN", label: "Unknown" },
  { value: "UNDER_500", label: "Under €500" },
  { value: "BETWEEN_500_AND_1000", label: "€500–1k" },
  { value: "BETWEEN_1000_AND_3000", label: "€1k–3k" },
  { value: "BETWEEN_3000_AND_6000", label: "€3k–6k" },
  { value: "ABOVE_6000", label: "€6k+" },
];

const decisionMakers = [
  { value: "UNKNOWN", label: "Unknown" },
  { value: "DECISION_MAKER", label: "Decision maker" },
  { value: "INFLUENCER", label: "Influencer" },
  { value: "NEEDS_APPROVAL", label: "Needs approval" },
];

export function LeadQualificationForm({ leadId, notes, isRead, leadScore, scoreReasons }: Props) {
  const [features, setFeatures] = useState("");
  const [references, setReferences] = useState("");
  const [state, action, pending] = useActionState<ActionResult>(saveQualification, { ok: true });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead qualification</CardTitle>
        <CardDescription>BANT-first with optional MEDDICC-lite details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="leadId" value={leadId} />
          <input type="hidden" name="mustHaveFeatures" value={serializeFeatures(features)} />
          <input type="hidden" name="referenceSites" value={serializeReferences(references)} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Budget range</Label>
              <Select name="budgetRange" defaultValue="UNKNOWN">
                <SelectTrigger>
                  <SelectValue placeholder="Budget range" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Decision maker</Label>
              <Select name="decisionMaker" defaultValue="UNKNOWN">
                <SelectTrigger>
                  <SelectValue placeholder="Decision role" />
                </SelectTrigger>
                <SelectContent>
                  {decisionMakers.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="targetDeadline">Target deadline</Label>
              <Input id="targetDeadline" name="targetDeadline" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextFollowUpAt">Next follow-up</Label>
              <Input id="nextFollowUpAt" name="nextFollowUpAt" type="datetime-local" />
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-2">
            <ToggleRow label="Need confirmed" name="bantNeedConfirmed" />
            <ToggleRow label="Timeline confirmed" name="bantTimelineConfirmed" />
            <ToggleRow label="Budget confirmed" name="bantBudgetConfirmed" />
            <ToggleRow label="Authority confirmed" name="bantAuthorityConfirmed" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Must-have features (one per line)</Label>
            <Textarea id="features" rows={3} value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Booking\nCRM\nAnalytics" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="references">Reference sites (one URL per line)</Label>
            <Textarea
              id="references"
              rows={3}
              value={references}
              onChange={(e) => setReferences(e.target.value)}
              placeholder="https://example.com\nhttps://another.com"
            />
          </div>

          <Accordion type="single" collapsible className="w-full border rounded-lg">
            <AccordionItem value="advanced">
              <AccordionTrigger className="px-4">Advanced (MEDDICC-lite)</AccordionTrigger>
              <AccordionContent className="space-y-3 px-4 pb-4">
                <ToggleRow label="Champion identified" name="championIdentified" />
                <div className="grid gap-3 md:grid-cols-2">
                  <TextBlock name="decisionCriteriaNotes" label="Decision criteria notes" />
                  <TextBlock name="decisionProcessNotes" label="Decision process notes" />
                  <TextBlock name="paperProcessNotes" label="Paper process / procurement" />
                  <TextBlock name="competitionNotes" label="Competition notes" />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="space-y-2">
            <Label htmlFor="qualificationNotes">Qualification notes</Label>
            <Textarea
              id="qualificationNotes"
              name="qualificationNotes"
              defaultValue={notes ?? ""}
              rows={4}
              placeholder="Discovery notes, blockers, next steps"
            />
            {state.fieldErrors?.qualificationNotes && <p className="text-xs text-destructive">{state.fieldErrors.qualificationNotes}</p>}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-slate-900">Mark as read</p>
              <p className="text-xs text-muted-foreground">Toggle to clear unread badge for this lead.</p>
            </div>
            <input type="hidden" name="markRead" value="false" />
            <Switch name="markRead" value="true" defaultChecked={isRead} />
          </div>

          <ScoreCard score={state.data?.leadScore ?? leadScore ?? 0} reasons={state.data?.reasons ?? scoreReasons ?? []} />

          {state.message && <p className={`text-sm ${state.ok ? "text-emerald-700" : "text-destructive"}`}>{state.message}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function serializeFeatures(text: string) {
  const arr = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return JSON.stringify(arr);
}

function serializeReferences(text: string) {
  const arr = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((url) => ({ url }));
  return JSON.stringify(arr);
}

function ToggleRow({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
      <span>{label}</span>
      <input type="hidden" name={name} value="false" />
      <Switch name={name} value="true" />
    </label>
  );
}

function TextBlock({ name, label }: { name: string; label: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} rows={3} />
    </div>
  );
}

function ScoreCard({ score, reasons }: { score: number; reasons: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Lead score</p>
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">{score}</div>
      </div>
      {reasons?.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {reasons.map((reason, idx) => (
            <li key={idx}>• {reason}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
