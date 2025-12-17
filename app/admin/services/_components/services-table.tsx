 "use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table/data-table";
import { cn } from "@/lib/utils";

export type ServiceRow = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  startingPrice: number | null;
  currency: string;
  deliveryDaysMin: number | null;
  deliveryDaysMax: number | null;
  packagesCount: number;
  isActive: boolean;
  updatedAt: string;
};

type Props = {
  data: ServiceRow[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
  status: string;
  sort: string;
};

export function ServicesTable({ data, total, page, pageSize, query, status, sort }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    service: true,
    startingPrice: true,
    delivery: true,
    packages: true,
    updated: true,
    status: true,
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const setParam = useCallback(
    (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const toggleSort = useCallback(
    (field: string) => {
    const [currentField, currentDir] = sort.split("-") as [string, "asc" | "desc"];
    const nextDir = currentField === field && currentDir === "asc" ? "desc" : "asc";
    setParam("sort", `${field}-${nextDir}`);
    },
    [setParam, sort]
  );

  const selectedAll = selectedIds.size > 0 && selectedIds.size === data.length;
  const selectedSome = selectedIds.size > 0 && selectedIds.size < data.length;

  const columns = useMemo(
    () => [
      {
        id: "service",
        header: "Service",
        sortable: true,
        sortDirection: sort.startsWith("title-") ? (sort.endsWith("asc") ? "asc" : "desc") : null,
        onSort: () => toggleSort("title"),
        cell: (row: ServiceRow) => (
          <div>
            <div className="font-medium">{row.title}</div>
            <div className="text-xs text-muted-foreground">{row.slug}</div>
          </div>
        ),
      },
      {
        id: "startingPrice",
        header: "Starting price",
        sortable: true,
        sortDirection: sort.startsWith("startingPrice-")
          ? sort.endsWith("asc")
            ? "asc"
            : "desc"
          : null,
        onSort: () => toggleSort("startingPrice"),
        cell: (row: ServiceRow) =>
          row.startingPrice != null ? `${row.currency} ${row.startingPrice.toFixed(0)}` : "—",
      },
      {
        id: "delivery",
        header: "Delivery",
        cell: (row: ServiceRow) =>
          row.deliveryDaysMin != null && row.deliveryDaysMax != null
            ? `${row.deliveryDaysMin}–${row.deliveryDaysMax} days`
            : "—",
      },
      {
        id: "packages",
        header: "Packages",
        cell: (row: ServiceRow) => row.packagesCount,
      },
      {
        id: "updated",
        header: "Updated",
        sortable: true,
        sortDirection: sort.startsWith("updatedAt-")
          ? sort.endsWith("asc")
            ? "asc"
            : "desc"
          : null,
        onSort: () => toggleSort("updatedAt"),
        cell: (row: ServiceRow) => format(new Date(row.updatedAt), "yyyy-MM-dd"),
      },
      {
        id: "status",
        header: "Status",
        cell: (row: ServiceRow) => (
          <Badge variant={row.isActive ? "default" : "secondary"}>
            {row.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: (row: ServiceRow) => <RowActions row={row} />,
        className: "text-right",
      },
    ],
    [sort, toggleSort]
  );

  const handleSearch = (formData: FormData) => {
    const value = (formData.get("q") as string) ?? "";
    setParam("q", value ? value : undefined);
  };

  const visibleCols = columns.filter((col) => {
    const id = col.id ?? "";
    const isVisible = visibleColumns[id] ?? true;
    return (isVisible || id === "actions");
  });

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Tabs
            value={status}
            onValueChange={(v) => setParam("status", v === "all" ? undefined : v)}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-wrap items-center gap-2">
            <form action={handleSearch} className="flex gap-2">
              <Input
                name="q"
                defaultValue={query}
                placeholder="Search services..."
                className="w-64"
              />
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                {columns
                  .filter((col) => col.id && col.id !== "actions")
                  .map((col) => (
                    <DropdownMenuItem
                      key={col.id}
                      onSelect={(e) => {
                        e.preventDefault();
                        if (!col.id) return;
                        setVisibleColumns((prev) => ({
                          ...prev,
                          [col.id!]: !(prev[col.id!] ?? true),
                        }));
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={visibleColumns[col.id!] ?? true}
                          readOnly
                          className="h-4 w-4"
                        />
                        <span>{col.header}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">No services yet — create your first service.</p>
          </div>
        ) : (
          <DataTable
            columns={visibleCols}
            data={data}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={(next) => setParam("page", String(next))}
            selection={{
              selectable: true,
              allSelected: selectedAll,
              someSelected: selectedSome,
              isSelected: (row) => selectedIds.has((row as ServiceRow).id),
              onToggleAll: () => {
                if (selectedAll) {
                  setSelectedIds(new Set());
                } else {
                  setSelectedIds(new Set(data.map((d) => d.id)));
                }
              },
              onToggleRow: (row) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  const id = (row as ServiceRow).id;
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                });
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

function RowActions({ row }: { row: ServiceRow }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/admin/services/${row.id}`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/services/new?duplicate=${row.id}`}>Duplicate</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Toggle Active (todo)</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" disabled>
          Delete (todo)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
