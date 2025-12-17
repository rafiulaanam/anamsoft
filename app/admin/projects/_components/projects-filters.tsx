"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectStatusValues } from "@/lib/validators/project";

type Filters = {
  q: string;
  status: string;
  health: string;
  due: string;
  view: string;
};

const healthOptions = [
  { key: "all", label: "All" },
  { key: "on-track", label: "On track" },
  { key: "at-risk", label: "At risk" },
  { key: "overdue", label: "Overdue" },
];

export function ProjectsFilters({ current }: { current: Filters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(current.q);

  const setParam = useCallback(
    (key: string, value?: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      if (value && value.length > 0) params.set(key, value);
      else params.delete(key);
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setParam("q", search || undefined);
    }, 300);
    return () => clearTimeout(handler);
  }, [search, setParam]);

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams?.toString());
    ["q", "status", "health", "due", "view", "trash", "page"].forEach((k) => params.delete(k));
    router.push(`${pathname}?${params.toString()}`);
  };

  const chips = useMemo(() => {
    const list: { label: string; key: string }[] = [];
    if (current.q) list.push({ label: `Search: ${current.q}`, key: "q" });
    if (current.status !== "all") list.push({ label: `Status: ${current.status}`, key: "status" });
    if (current.health !== "all") list.push({ label: `Health: ${healthOptions.find((h) => h.key === current.health)?.label ?? current.health}`, key: "health" });
    if (current.due === "next7") list.push({ label: "Due next 7 days", key: "due" });
    if (current.view !== "active") list.push({ label: `View: ${current.view}`, key: "view" });
    return list;
  }, [current]);

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <Input
            name="q"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or clients..."
            className="min-w-[240px] flex-1"
          />

          <Tabs value={current.view || "active"} onValueChange={(v) => setParam("view", v === "active" ? undefined : v)}>
            <TabsList className="h-9">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
              <TabsTrigger value="trash">Trash</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={current.due || "any"} onValueChange={(v) => setParam("due", v === "any" ? undefined : v)}>
            <TabsList className="h-9">
              <TabsTrigger value="any">Any deadline</TabsTrigger>
              <TabsTrigger value="next7">Next 7 days</TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {["all", ...ProjectStatusValues].map((s) => (
                <DropdownMenuItem key={s} onSelect={() => setParam("status", s === "all" ? undefined : s)}>
                  {s === "all" ? "All" : s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Health
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Health</DropdownMenuLabel>
              {healthOptions.map((h) => (
                <DropdownMenuItem key={h.key} onSelect={() => setParam("health", h.key === "all" ? undefined : h.key)}>
                  {h.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.length === 0 ? (
          <p className="text-xs text-muted-foreground">No filters applied.</p>
        ) : (
          chips.map((chip) => (
            <Badge
              key={chip.key}
              variant="outline"
              className="cursor-pointer"
              onClick={() => setParam(chip.key, undefined)}
            >
              {chip.label} ✕
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
