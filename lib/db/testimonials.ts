import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type TestimonialFilter = "all" | "published" | "draft";
export type TestimonialSort = "sortOrder" | "updatedAt";

export interface TestimonialListParams {
  search?: string;
  filter?: TestimonialFilter;
  sort?: TestimonialSort;
  direction?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

export async function listTestimonials(params: TestimonialListParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, params.pageSize ?? DEFAULT_PAGE_SIZE));
  const skip = (page - 1) * pageSize;

  const where: Prisma.TestimonialWhereInput = {};
  if (params.filter === "published") {
    where.isPublished = true;
  } else if (params.filter === "draft") {
    where.isPublished = false;
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { subtitle: { contains: params.search, mode: "insensitive" } },
      { quote: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const sortField = params.sort ?? "sortOrder";
  const orderBy: Record<string, "asc" | "desc"> = {};
  orderBy[sortField] = params.direction ?? (sortField === "sortOrder" ? "asc" : "desc");

  const [total, items] = await Promise.all([
    prisma.testimonial.count({ where }),
    prisma.testimonial.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    }),
  ]);

  return { items, total, page, pageSize };
}

export async function getTestimonial(id: string) {
  return prisma.testimonial.findUnique({ where: { id } });
}

export async function createTestimonial(payload: {
  name: string;
  subtitle?: string | null;
  quote: string;
  avatarUrl?: string | null;
  rating?: number;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  return prisma.testimonial.create({
    data: {
      name: payload.name,
      subtitle: payload.subtitle ?? null,
      quote: payload.quote,
      avatarUrl: payload.avatarUrl ?? null,
      rating: payload.rating ?? null,
      sortOrder: payload.sortOrder ?? 0,
      isPublished: payload.isPublished ?? true,
    },
  });
}

export async function updateTestimonial(
  id: string,
  payload: {
    name?: string;
    subtitle?: string | null;
    quote?: string;
    avatarUrl?: string | null;
    rating?: number | null;
    sortOrder?: number;
    isPublished?: boolean;
  }
) {
  return prisma.testimonial.update({
    where: { id },
    data: {
      name: payload.name,
      subtitle: payload.subtitle,
      quote: payload.quote,
      avatarUrl: payload.avatarUrl,
      rating: payload.rating,
      sortOrder: payload.sortOrder,
      isPublished: payload.isPublished,
    },
  });
}

export async function deleteTestimonial(id: string) {
  return prisma.testimonial.delete({ where: { id } });
}
