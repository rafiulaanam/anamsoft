import { useCallback, useMemo, useState } from "react";
import { isOverdueLead } from "@/lib/lead-utils";
import type { LeadRow } from "@/types/lead";
import type { LeadStatus } from "@prisma/client";

export type QuickViewKey = "ALL" | "TODAY" | "THIS_WEEK" | "OVERDUE" | "HIGH_BUDGET";
export type SavedFilterKey = "NEW_UNREAD" | "QUALIFIED_ONLY" | null;

export const leadQuickViews: { key: QuickViewKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "TODAY", label: "Today" },
  { key: "THIS_WEEK", label: "This week" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "HIGH_BUDGET", label: "High budget" },
];

export const leadSavedFilters: { key: SavedFilterKey; label: string }[] = [
  { key: "NEW_UNREAD", label: "New + Unread" },
  { key: "QUALIFIED_ONLY", label: "Qualified only" },
];

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function withinDays(value: string | null | undefined, days: number) {
  const date = parseDate(value);
  if (!date) return false;
  const now = Date.now();
  const diff = now - date.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function matchesHighBudget(lead: LeadRow) {
  const highRanges = new Set(["BETWEEN_1000_AND_3000", "BETWEEN_3000_AND_6000", "ABOVE_6000"]);
  if (highRanges.has(lead.budgetRange ?? "")) return true;
  if (typeof lead.value === "number") {
    return lead.value >= 800;
  }
  return false;
}

function matchesQuickView(lead: LeadRow, quickView: QuickViewKey) {
  if (quickView === "ALL") return true;
  if (quickView === "TODAY") {
    return withinDays(lead.createdAt, 1);
  }
  if (quickView === "THIS_WEEK") {
    return withinDays(lead.createdAt, 7);
  }
  if (quickView === "OVERDUE") {
    return isOverdueLead(lead);
  }
  if (quickView === "HIGH_BUDGET") {
    return matchesHighBudget(lead);
  }
  return true;
}

type UseLeadsFiltersOptions = {
  initialStatusFilter?: LeadStatus | "ALL";
  initialUnreadOnly?: boolean;
};

export function useLeadsFilters(leads: LeadRow[], options?: UseLeadsFiltersOptions) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">(options?.initialStatusFilter ?? "ALL");
  const [unreadOnly, setUnreadOnly] = useState(options?.initialUnreadOnly ?? false);
  const [quickView, setQuickView] = useState<QuickViewKey>("ALL");
  const [savedFilter, setSavedFilter] = useState<SavedFilterKey>(null);

  const toggleSavedFilter = useCallback(
    (filter: SavedFilterKey) => {
      setSavedFilter((prev) => {
        if (prev === filter) {
          setStatusFilter("ALL");
          setUnreadOnly(false);
          return null;
        }
        switch (filter) {
          case "NEW_UNREAD":
            setStatusFilter("NEW");
            setUnreadOnly(true);
            break;
          case "QUALIFIED_ONLY":
            setStatusFilter("QUALIFIED_TO_BUY");
            setUnreadOnly(false);
            break;
          default:
            setStatusFilter("ALL");
            setUnreadOnly(false);
            break;
        }
        return filter;
      });
    },
    [],
  );

  const clearSavedFilter = useCallback(() => {
    setSavedFilter(null);
  }, []);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (statusFilter !== "ALL" && lead.leadStatus !== statusFilter) {
        return false;
      }
      if (unreadOnly && !lead.unread) {
        return false;
      }
      if (!matchesQuickView(lead, quickView)) {
        return false;
      }
      if (normalizedSearch) {
        const haystack = [
          lead.fullName,
          lead.company,
          lead.email,
          lead.website,
        ]
          .filter(Boolean)
          .map((value) => value!.toLowerCase());
        if (!haystack.some((value) => value.includes(normalizedSearch))) {
          return false;
        }
      }
      return true;
    });
  }, [leads, normalizedSearch, quickView, statusFilter, unreadOnly]);

  return {
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
  };
}
