import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type FaqFilter = "all" | "published" | "draft";
export type FaqSort = "sortOrder" | "updatedAt";

export interface FaqListParams {
  search?: string;
  filter?: FaqFilter;
  sort?: FaqSort;
  direction?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

export async function listFaqs(params: FaqListParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, params.pageSize ?? DEFAULT_PAGE_SIZE));
  const skip = (page - 1) * pageSize;

  const where: Prisma.FaqWhereInput = {};
  if (params.filter === "published") {
    where.isPublished = true;
  } else if (params.filter === "draft") {
    where.isPublished = false;
  }

  if (params.search) {
    where.OR = [
      { question: { contains: params.search, mode: "insensitive" } },
      { answer: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const sortField = params.sort ?? "sortOrder";
  const orderBy: Record<string, "asc" | "desc"> = {};
  orderBy[sortField] = params.direction ?? (sortField === "sortOrder" ? "asc" : "desc");

  const [total, items] = await Promise.all([
    prisma.faq.count({ where }),
    prisma.faq.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    }),
  ]);

  return { items, total, page, pageSize };
}

export async function getFaq(id: string) {
  return prisma.faq.findUnique({ where: { id } });
}

export async function createFaq(payload: {
  question: string;
  answer: string;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  return prisma.faq.create({
    data: {
      question: payload.question,
      answer: payload.answer,
      sortOrder: payload.sortOrder ?? 0,
      isPublished: payload.isPublished ?? true,
    },
  });
}

export async function updateFaq(id: string, payload: {
  question?: string;
  answer?: string;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  return prisma.faq.update({
    where: { id },
    data: {
      question: payload.question,
      answer: payload.answer,
      sortOrder: payload.sortOrder,
      isPublished: payload.isPublished,
    },
  });
}

export async function deleteFaq(id: string) {
  return prisma.faq.delete({ where: { id } });
}
