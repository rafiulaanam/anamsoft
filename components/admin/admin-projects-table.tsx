"use client";

import { useRouter } from "next/navigation";
import type { Project, User } from "@prisma/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminProjectsTableProps {
  projects: (Project & { client: User })[];
}

const formatDate = (value?: Date | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

export function AdminProjectsTable({ projects }: AdminProjectsTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                No projects yet.
              </TableCell>
            </TableRow>
          )}
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="text-sm font-medium">{project.name}</TableCell>
              <TableCell className="text-sm">
                {project.client?.name || "-"}
                <div className="text-xs text-muted-foreground">{project.client?.email}</div>
              </TableCell>
              <TableCell className="text-sm">
                <Badge variant="outline">{project.status}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{project.type || "-"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDate(project.dueDate)}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => router.push(`/admin/projects/${project.id}`)}>
                  Open
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
