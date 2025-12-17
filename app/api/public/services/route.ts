import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
};

export async function GET() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [
      { sortOrder: "asc" },
      { updatedAt: "desc" },
    ],
  });
  return NextResponse.json(services, { headers: CACHE_HEADERS });
}
