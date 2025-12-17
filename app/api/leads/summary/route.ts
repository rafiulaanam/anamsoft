import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [total, unread] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { unread: true } }),
    ]);
    return NextResponse.json({ total, unread });
  } catch (error) {
    console.error("Error fetching lead summary", error);
    return NextResponse.json({ error: "Failed to load lead summary" }, { status: 500 });
  }
}
