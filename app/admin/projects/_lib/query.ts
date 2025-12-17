import { Prisma } from "@prisma/client";

export type ProjectSearch = {
  q: string;
  status: string;
  health: string;
  view: "active" | "archived" | "trash";
  due: string;
  page: number;
  pageSize: number;
  sort: string;
};

const DEFAULTS: ProjectSearch = {
  q: "",
  status: "all",
  health: "all",
  view: "active",
  due: "",
  page: 1,
  pageSize: 10,
  sort: "updatedAt-desc",
};

export function parseProjectSearchParams(searchParams: Record<string, string | string[] | undefined>): ProjectSearch {
  const get = (key: string) => {
    const val = searchParams[key];
    return Array.isArray(val) ? val[0] : val;
  };

  const legacyTrash = get("trash") === "true";
  const viewParam = (get("view") as ProjectSearch["view"] | undefined) ?? (legacyTrash ? "trash" : undefined);

  const page = Math.max(Number(get("page") ?? DEFAULTS.page), 1);
  const pageSize = Math.max(Number(get("pageSize") ?? DEFAULTS.pageSize), 1);
  const sort = get("sort") ?? DEFAULTS.sort;

  return {
    q: (get("q") ?? DEFAULTS.q).trim(),
    status: get("status") ?? DEFAULTS.status,
    health: get("health") ?? DEFAULTS.health,
    view: viewParam ?? DEFAULTS.view,
    due: get("due") ?? DEFAULTS.due,
    page,
    pageSize,
    sort,
  };
}

export function buildProjectOrderBy(parsed: ProjectSearch): Prisma.ProjectOrderByWithRelationInput {
  const [field, direction] = parsed.sort.split("-") as [string, "asc" | "desc"];
  return { [field || "updatedAt"]: direction === "asc" ? "asc" : "desc" } as any;
}

export function buildProjectWhereClause(parsed: ProjectSearch, supports: { deleted: boolean; archived: boolean }): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};
  const now = new Date();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (supports.deleted) {
    (where as any).deletedAt = parsed.view === "trash" ? { not: null } : null;
  }
  if (supports.archived) {
    if (parsed.view === "archived") {
      (where as any).archivedAt = { not: null };
    } else if (parsed.view !== "trash") {
      (where as any).archivedAt = null;
    }
  }

  if (parsed.status !== "all") where.status = parsed.status as any;

  if (parsed.q) {
    where.OR = [
      { name: { contains: parsed.q, mode: "insensitive" } },
      { clientName: { contains: parsed.q, mode: "insensitive" } },
      { clientEmail: { contains: parsed.q, mode: "insensitive" } },
      { scopeSummary: { contains: parsed.q, mode: "insensitive" } },
    ];
  }

  if (parsed.due === "next7") {
    where.deadline = { gte: now, lte: nextWeek };
  }

  if (parsed.health === "overdue") {
    where.deadline = { lt: now };
  } else if (parsed.health === "at-risk") {
    where.deadline = { gte: now, lte: nextWeek };
  } else if (parsed.health === "on-track") {
    where.OR = [
      ...(where.OR ?? []),
      { deadline: { gt: nextWeek } },
      { deadline: null },
    ];
  }

  return where;
}
