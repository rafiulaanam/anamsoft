import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id?: string } }
) {
  if (!params?.id) {
    return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({ where: { id: params.id } });
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const packages = await prisma.servicePackage.findMany({
    where: { serviceId: params.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(
    packages.map((pkg) => ({
      ...pkg,
      features: pkg.features ?? [],
    }))
  );
}
