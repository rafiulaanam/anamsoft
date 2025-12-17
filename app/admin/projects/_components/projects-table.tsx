"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { archiveProject, softDeleteProject, deleteProjectPermanently, duplicateProject, restoreProject, unarchiveProject } from "../_actions/projects";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type ProjectRow = {
  id: string;
  name: string;
  clientName: string;
  status: string;
  health: "On track" | "At risk" | "Overdue";
  healthHint: string;
  deadline: string | null;
  deadlineLabel: string;
  reqPct: number;
  updatedAt: string;
  archived?: boolean;
  deleted?: boolean;
};

type Props = {
  data: ProjectRow[];
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  view?: "active" | "archived" | "trash" | string;
};

export function ProjectsTable({ data, total, page, pageSize, sort, view }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [rowSelection, setRowSelection] = useState({});
  const [quickView, setQuickView] = useState<ProjectRow | null>(null);
  const [filterText, setFilterText] = useState("");
  const [pending, startTransition] = useTransition();
  const [commandOpen, setCommandOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; permanent: boolean } | null>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const lastToastRef = useRef<string | number | undefined>(undefined);

  const filteredData = useMemo(() => {
    const q = filterText.toLowerCase();
    if (!q) return data;
    return data.filter((row) => row.name.toLowerCase().includes(q) || row.clientName.toLowerCase().includes(q));
  }, [data, filterText]);

  const showToastOnce = useCallback(
    (res: any, successTitle: string, failureTitle: string) => {
      const nonce = res?.nonce ?? res?.updatedAt ?? Date.now();
      if (lastToastRef.current === nonce) return;
      lastToastRef.current = nonce;
      toast({ title: res.ok ? successTitle : failureTitle, description: res.message, variant: res.ok ? "default" : "destructive" });
    },
    [toast]
  );

  const handleArchive = useCallback((id: string, archived?: boolean) => {
    startTransition(async () => {
      const res = archived ? await unarchiveProject(id) : await archiveProject(id);
      showToastOnce(res, archived ? "Unarchived" : "Archived", archived ? "Unarchive failed" : "Archive failed");
      if (res.ok) router.refresh();
    });
  }, [router, showToastOnce]);

  const performDelete = useCallback(
    async (target: { id: string; permanent: boolean }, confirmation?: string) => {
      if (target.permanent && confirmation !== "DELETE") return;
      startTransition(async () => {
        const res = target.permanent ? await deleteProjectPermanently(target.id) : await softDeleteProject(target.id);
        showToastOnce(res, target.permanent ? "Deleted permanently" : "Moved to trash", "Delete failed");
        if (res.ok) router.refresh();
      });
    },
    [router, showToastOnce]
  );

  const handleDelete = useCallback(
    (id: string, isDeleted?: boolean) => {
      setConfirmTarget({ id, permanent: !!isDeleted });
      setConfirmInput("");
      setConfirmOpen(true);
    },
    []
  );

  const handleDuplicate = useCallback((id: string) => {
    startTransition(async () => {
      const res = await duplicateProject(id);
      showToastOnce(res, "Duplicated", "Duplicate failed");
      if (res.ok) router.refresh();
    });
  }, [router, showToastOnce]);

  const handleRestore = useCallback((id: string) => {
    startTransition(async () => {
      const res = await restoreProject(id);
      showToastOnce(res, "Restored", "Restore failed");
      if (res.ok) router.refresh();
    });
  }, [router, showToastOnce]);

  const columns = useMemo<ColumnDef<ProjectRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox checked={row.getIsSelected()} onChange={(e) => row.toggleSelected(e.target.checked)} aria-label="Select row" />
        ),
      },
      {
        accessorKey: "name",
        header: "Project",
        cell: ({ row }) => (
          <div className="cursor-pointer" onClick={() => setQuickView(row.original)}>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.clientName || "No client"}</div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
      },
      {
        accessorKey: "health",
        header: "Health",
        cell: ({ row }) => (
          <Badge variant={row.original.health === "Overdue" ? "destructive" : row.original.health === "At risk" ? "secondary" : "outline"}>
            {row.original.health}
          </Badge>
        ),
      },
      {
        accessorKey: "deadlineLabel",
        header: "Deadline",
        cell: ({ row }) => <span className="text-sm">{row.original.deadlineLabel}</span>,
      },
      {
        accessorKey: "reqPct",
        header: "Requirements",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${row.original.reqPct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{row.original.reqPct}%</span>
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => format(new Date(row.original.updatedAt), "yyyy-MM-dd"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActions
            row={row.original}
            onQuickView={() => setQuickView(row.original)}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onRestore={handleRestore}
            view={view}
          />
        ),
      },
    ],
    [handleArchive, handleDelete, handleDuplicate, handleRestore, view]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id);

  const handleBulkArchive = () => {
    if (view === "trash") return;
    selectedIds.forEach((id) => handleArchive(id));
  };
  const handleBulkDelete = () => {
    const permanent = view === "trash";
    selectedIds.forEach((id) => handleDelete(id, permanent));
  };
  // Command palette
  const paletteItems = data.slice(0, 20); // basic subset

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Quick filter on page..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-64"
          />
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkArchive}
                disabled={pending || selectedIds.length === 0 || view === "trash"}
              >
                Archive selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={pending || selectedIds.length === 0}
              >
                {view === "trash" ? "Delete permanently" : "Delete selected"}
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCommandOpen(true)}>
              Cmd+K
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} onClick={() => setQuickView(row.original)} className="cursor-pointer">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} onClick={(e) => e.stopPropagation()}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-sm text-muted-foreground">
                      <div>
                        {view === "trash"
                          ? "Trash is empty. Move a project to trash to manage here."
                          : view === "archived"
                            ? "No archived projects."
                            : "No projects yet."}
                      </div>
                      <div className="flex gap-2">
                        {view === "trash" && (
                          <Button variant="outline" size="sm" onClick={() => router.push("/admin/projects?view=active")}>
                            Go to active
                          </Button>
                        )}
                        {view === "archived" && (
                          <Button variant="outline" size="sm" onClick={() => router.push("/admin/projects?view=active")}>
                            Back to active
                          </Button>
                        )}
                        {view !== "trash" && (
                          <Button asChild size="sm">
                            <Link href="/admin/projects/new">Create project</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
        <ProjectCommandPalette
          open={commandOpen}
          onOpenChange={setCommandOpen}
          items={paletteItems}
          onOpenProject={(id) => (window.location.href = `/admin/projects/${id}`)}
          onDuplicate={handleDuplicate}
          onArchive={handleArchive}
          onRestore={handleRestore}
        />
      </CardContent>

      <Dialog open={!!quickView} onOpenChange={(open) => !open && setQuickView(null)}>
        <DialogContent className="sm:max-w-lg">
          {quickView && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{quickView.name}</span>
                  <Badge variant="outline">{quickView.health}</Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Client: {quickView.clientName || "N/A"}</p>
                <p className="text-sm">
                  Status: <Badge variant="outline">{quickView.status}</Badge>
                </p>
                <p className="text-sm">Deadline: {quickView.deadlineLabel}</p>
                <div className="space-y-2 w-full">
                  <p className="text-sm font-medium">Requirements</p>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${quickView.reqPct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{quickView.reqPct}% complete</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/admin/projects/${quickView.id}`}>Open</Link>
                  </Button>
                  {!quickView.deleted && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleDuplicate(quickView.id)} disabled={pending}>
                        Duplicate
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleArchive(quickView.id, quickView.archived)} disabled={pending}>
                        {quickView.archived ? "Unarchive" : "Archive"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(quickView.id, false)} disabled={pending}>
                        Move to trash
                      </Button>
                    </>
                  )}
                  {quickView.deleted && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleRestore(quickView.id)} disabled={pending}>
                        Restore
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(quickView.id, true)} disabled={pending}>
                        Delete permanently
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmTarget?.permanent ? "Permanently delete this project?" : "Move project to Trash?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {confirmTarget?.permanent
                ? "Type DELETE to confirm permanent deletion. This cannot be undone."
                : "You can restore this project from Trash later."}
              {confirmTarget?.permanent && (
                <Input
                  autoFocus
                  placeholder="Type DELETE to confirm"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                />
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmTarget?.permanent ? confirmInput !== "DELETE" : false}
              onClick={() => {
                if (confirmTarget) performDelete(confirmTarget, confirmInput);
                setConfirmOpen(false);
              }}
            >
              {confirmTarget?.permanent ? "Delete" : "Move to Trash"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function RowActions({
  row,
  onQuickView,
  onDuplicate,
  onArchive,
  onDelete,
  onRestore,
  view,
}: {
  row: ProjectRow;
  onQuickView: () => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string, archived?: boolean) => void;
  onDelete: (id: string, isDeleted?: boolean) => void;
  onRestore: (id: string) => void;
  view?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/admin/projects/${row.id}`}>Open</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onQuickView}>Quick view</DropdownMenuItem>
        {view !== "trash" && <DropdownMenuItem onSelect={() => onDuplicate(row.id)}>Duplicate</DropdownMenuItem>}
        {view === "active" && (
          <>
            <DropdownMenuItem onSelect={() => onArchive(row.id, row.archived)}>
              {row.archived ? "Unarchive" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(row.id, false)}>Move to trash</DropdownMenuItem>
          </>
        )}
        {view === "archived" && (
          <>
            <DropdownMenuItem onSelect={() => onArchive(row.id, true)}>Unarchive</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(row.id, false)}>Move to trash</DropdownMenuItem>
          </>
        )}
        {view === "trash" && (
          <>
            <DropdownMenuItem onSelect={() => onRestore(row.id)}>Restore</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(row.id, true)} className="text-destructive">
              Delete permanently
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProjectCommandPalette({
  open,
  onOpenChange,
  items,
  onOpenProject,
  onDuplicate,
  onArchive,
  onRestore,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ProjectRow[];
  onOpenProject: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="Jump to project, action..." />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Projects">
            {items.map((p) => (
              <CommandItem key={p.id} onSelect={() => onOpenProject(p.id)}>
                {p.name} — {p.clientName || "No client"}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Quick actions">
            {items.slice(0, 5).map((p) => (
              <CommandItem key={`${p.id}-dup`} onSelect={() => onDuplicate(p.id)}>
                Duplicate {p.name}
              </CommandItem>
            ))}
            {items.slice(0, 5).map((p) => (
              <CommandItem key={`${p.id}-archive`} onSelect={() => onArchive(p.id)}>
                Archive {p.name}
              </CommandItem>
            ))}
            {items.filter((p) => p.deleted).slice(0, 5).map((p) => (
              <CommandItem key={`${p.id}-restore`} onSelect={() => onRestore(p.id)}>
                Restore {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
