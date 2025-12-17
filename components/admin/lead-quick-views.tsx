"use client";

import { Button } from "@/components/ui/button";
import { leadQuickViews, leadSavedFilters, QuickViewKey, SavedFilterKey } from "@/hooks/use-leads-filters";

type LeadQuickViewsProps = {
  quickView: QuickViewKey;
  onSelectQuickView: (key: QuickViewKey) => void;
  savedFilter: SavedFilterKey;
  onApplySavedFilter: (key: SavedFilterKey) => void;
};

export function LeadQuickViews({ quickView, onSelectQuickView, savedFilter, onApplySavedFilter }: LeadQuickViewsProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tracking-wide text-slate-500">Quick view</span>
        {leadQuickViews.map((option) => {
          const isActive = quickView === option.key;
          return (
            <Button
              key={option.key}
              size="sm"
              variant={isActive ? "secondary" : "ghost"}
              onClick={() => onSelectQuickView(option.key)}
              aria-pressed={isActive}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tracking-wide text-slate-500">Saved filters</span>
        {leadSavedFilters.map((option) => {
          const isActive = savedFilter === option.key;
          return (
            <Button
              key={option.key}
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={() => onApplySavedFilter(option.key)}
              aria-pressed={isActive}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
