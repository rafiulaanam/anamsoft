import { cache } from "react";
import { prisma } from "@/lib/db";

export const getPublishedTestimonials = cache(async () => {
  return prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    take: 6,
  });
});

export const getPublishedFaqs = cache(async () => {
  return prisma.faq.findMany({
    where: { isPublished: true },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });
});
