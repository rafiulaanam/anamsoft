import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type Column<T> = {
  id?: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
  selection?: {
    selectable: boolean;
    allSelected: boolean;
    someSelected: boolean;
    isSelected: (row: T) => boolean;
    onToggleAll: () => void;
    onToggleRow: (row: T) => void;
  };
};

export function DataTable<T>({
  columns,
  data,
  page,
  pageSize,
  total,
  onPageChange,
  selection,
}: DataTableProps<T>) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            {selection?.selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selection.allSelected ? true : selection.someSelected ? "indeterminate" : false}
                  onCheckedChange={selection.onToggleAll}
                  aria-label="Select all rows"
                />
              </TableHead>
            )}
            {columns.map((col, idx) => (
              <TableHead key={idx} className={cn(col.className, col.sortable && "cursor-pointer")} onClick={col.onSort}>
                <div className="flex items-center gap-1">
                  <span>{col.header}</span>
                  {col.sortable && (
                    <span className="text-xs text-muted-foreground">
                      {col.sortDirection === "asc" ? "▲" : col.sortDirection === "desc" ? "▼" : "⇅"}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIdx) => (
            <TableRow key={rowIdx}>
              {selection?.selectable && (
                <TableCell className="w-12">
                  <Checkbox
                    checked={selection.isSelected(row)}
                    onCheckedChange={() => selection.onToggleRow(row)}
                    aria-label="Select row"
                  />
                </TableCell>
              )}
              {columns.map((col, colIdx) => (
                <TableCell key={colIdx} className={col.className}>
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
