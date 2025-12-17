import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
};

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    take: 6,
  });
  return NextResponse.json(testimonials, { headers: CACHE_HEADERS });
}
