import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
};

export async function GET() {
  const faqs = await prisma.faq.findMany({
    where: { isPublished: true },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });
  return NextResponse.json(faqs, { headers: CACHE_HEADERS });
}
