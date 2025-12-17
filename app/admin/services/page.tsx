import { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ServicesTable } from "./_components/services-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1";

type SearchParams = {
  q?: string;
  status?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
};

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (isBuild) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Services</h1>
            <p className="text-sm text-muted-foreground">
              Loading preview (build placeholder)
            </p>
          </div>
          <Button asChild>
            <Link href="#">New Service</Link>
          </Button>
        </div>
      </div>
    );
  }

  const q = (searchParams.q ?? "").trim();
  const status = searchParams.status ?? "all";
  const page = Math.max(Number(searchParams.page ?? 1), 1);
  const pageSize = Math.max(Number(searchParams.pageSize ?? 10), 1);
  const sort = searchParams.sort ?? "updatedAt-desc";

  // Skip legacy rows with null/empty titles to avoid decode errors from bad data.
  const where: Prisma.ServiceWhereInput = { title: { gt: "" } };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status === "active") {
    where.isActive = true;
  } else if (status === "inactive") {
    where.isActive = false;
  }

  const [field, direction] = sort.split("-") as [string, "asc" | "desc"];
  const orderBy: Prisma.ServiceOrderByWithRelationInput = {};
  if (field) {
    (orderBy as any)[field] = direction === "asc" ? "asc" : "desc";
  } else {
    orderBy.updatedAt = "desc";
  }

  const [total, services] = await Promise.all([
    prisma.service.count({ where }),
    prisma.service.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        startingPrice: true,
        currency: true,
        deliveryDaysMin: true,
        deliveryDaysMax: true,
        isActive: true,
        updatedAt: true,
        _count: { select: { packages: true } },
      },
    }),
  ]);

  const rows = services.map((svc) => ({
    id: svc.id,
    title: svc.title ?? "(untitled)",
    slug: svc.slug ?? "",
    shortDescription: svc.shortDescription ?? "",
    startingPrice: svc.startingPrice ? Number(svc.startingPrice) : null,
    currency: svc.currency,
    deliveryDaysMin: svc.deliveryDaysMin ?? null,
    deliveryDaysMax: svc.deliveryDaysMax ?? null,
    packagesCount: svc._count?.packages ?? 0,
    isActive: typeof (svc as any).isActive === "boolean" ? (svc as any).isActive : true,
    updatedAt: svc.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Services</h1>
          <p className="text-sm text-muted-foreground">
            Manage your service catalog and packages.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">New Service</Link>
        </Button>
      </div>

      <ServicesTable
        data={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        query={q}
        status={status}
        sort={sort}
      />
    </div>
  );
}
