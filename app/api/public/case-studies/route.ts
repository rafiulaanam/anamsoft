import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const caseStudies = await prisma.caseStudy.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(caseStudies, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
