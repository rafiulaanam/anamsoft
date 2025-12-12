"use client";

import { useState } from "react";
import type { WebsiteAudit } from "@prisma/client";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface AdminWebsiteAuditsTableProps {
  audits: (WebsiteAudit & { createdAt: string | Date })[];
}

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function AdminWebsiteAuditsTable({ audits }: AdminWebsiteAuditsTableProps) {
  const [selected, setSelected] = useState<WebsiteAudit | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Main goal</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audits.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  No website audit requests yet.
                </TableCell>
              </TableRow>
            )}

            {audits.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell className="whitespace-nowrap text-xs md:text-sm">
                  {audit.createdAt ? formatDate(audit.createdAt) : "-"}
                </TableCell>
                <TableCell className="text-xs md:text-sm">{audit.name}</TableCell>
                <TableCell className="text-xs md:text-sm">{audit.email}</TableCell>
                <TableCell className="text-xs md:text-sm">
                  <a href={audit.websiteUrl} target="_blank" rel="noreferrer" className="underline">
                    {audit.websiteUrl}
                  </a>
                </TableCell>
                <TableCell className="text-xs md:text-sm">
                  <Badge variant="outline">{audit.mainGoal}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setSelected(audit)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Website audit request</DialogTitle>
            <DialogDescription>Details of the audit request submitted from your site.</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">{selected.name}</p>
                <p className="text-muted-foreground">{selected.email}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-muted-foreground">Website</p>
                <a href={selected.websiteUrl} target="_blank" rel="noreferrer" className="underline break-all">
                  {selected.websiteUrl}
                </a>
              </div>

              {selected.businessType && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Business type</p>
                  <p>{selected.businessType}</p>
                </div>
              )}

              <div>
                <p className="text-xs uppercase text-muted-foreground">Main goal</p>
                <p>{selected.mainGoal}</p>
              </div>

              {selected.message && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Message</p>
                  <p>{selected.message}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
