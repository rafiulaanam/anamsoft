import type { LeadRow } from "@/types/lead";

const relativeTimeUnits: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: "year", seconds: 60 * 60 * 24 * 365 },
  { unit: "month", seconds: 60 * 60 * 24 * 30 },
  { unit: "week", seconds: 60 * 60 * 24 * 7 },
  { unit: "day", seconds: 60 * 60 * 24 },
  { unit: "hour", seconds: 60 * 60 },
  { unit: "minute", seconds: 60 },
  { unit: "second", seconds: 1 },
];

const relativeTimeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

type BudgetBadgeVariant = "default" | "outline" | "secondary" | "destructive";

export type BudgetBadge = { label: string; variant: BudgetBadgeVariant };

export type FormatRelativeTimeArgs = {
  lastActivityAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type FormatRelativeTimeResult = {
  label: string;
  title?: string;
};

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatRelativeTime({ lastActivityAt, updatedAt, createdAt }: FormatRelativeTimeArgs): FormatRelativeTimeResult {
  const date = [lastActivityAt, updatedAt, createdAt]
    .map((value) => parseDate(value))
    .find((entry): entry is Date => entry !== null);

  if (!date) {
    return { label: "—" };
  }

  const diffSeconds = (date.getTime() - Date.now()) / 1000;
  const absSeconds = Math.abs(diffSeconds);
  const unit = relativeTimeUnits.find((entry) => absSeconds >= entry.seconds) ?? relativeTimeUnits[relativeTimeUnits.length - 1];
  const value = Math.round(diffSeconds / unit.seconds);
  return {
    label: relativeTimeFormat.format(value, unit.unit),
    title: date.toLocaleString(),
  };
}

function parseBudgetValue(value?: number | string | null): number | null {
  if (value == null) return null;
  if (typeof value === "number") return value;
  const numeric = Number(value.toString().replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

export function getBudgetBadge(value?: number | string | null): BudgetBadge {
  const numeric = parseBudgetValue(value);
  if (numeric == null) {
    return { label: "—", variant: "outline" };
  }
  if (numeric < 400) {
    return { label: "<400€", variant: "secondary" };
  }
  if (numeric < 800) {
    return { label: "400–800€", variant: "default" };
  }
  return { label: "800€+", variant: "destructive" };
}

export function getLeadSourceLabel(source?: string | null): string {
  const cleaned = source?.trim().toLowerCase();
  if (!cleaned) return "Website contact";
  if (cleaned.includes("estimate")) return "Estimate";
  if (cleaned.includes("audit")) return "Audit";
  if (cleaned.includes("whatsapp")) return "WhatsApp";
  if (cleaned.includes("manual") || cleaned.includes("referral") || cleaned.includes("event")) return "Manual";
  // fallback to Website contact when the value looks like a contact form
  if (cleaned.includes("website") || cleaned.includes("contact") || cleaned.includes("google")) {
    return "Website contact";
  }
  return cleaned
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function hasReplyActivity(lead: LeadRow): boolean {
  if (!lead.activities?.length) return false;
  const replyPattern = /reply|respond|replied/i;
  return lead.activities.some(
    (activity) =>
      replyPattern.test(activity.type) || replyPattern.test(activity.message) || replyPattern.test(activity.metadata?.message?.toString?.() ?? ""),
  );
}

export function isOverdueLead(lead: LeadRow): boolean {
  if (lead.leadStatus !== "NEW") return false;
  const created = parseDate(lead.createdAt);
  if (!created) return false;
  const isOlderThan24h = Date.now() - created.getTime() > 1000 * 60 * 60 * 24;
  const replied = Boolean(lead.repliedAt) || hasReplyActivity(lead);
  return isOlderThan24h && !replied;
}
