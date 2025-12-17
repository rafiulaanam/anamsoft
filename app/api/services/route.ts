import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return undefined;
};

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { updatedAt: "desc" },
      ],
    });
    return NextResponse.json({ data: services });
  } catch (error) {
    console.error("Error fetching services", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      shortDescription,
      description,
      icon,
      imageUrl,
      startingPrice,
      currency,
      deliveryDaysMin,
      deliveryDaysMax,
      isActive,
    } = body ?? {};

    if (!title || !slug || !shortDescription || !description) {
      return NextResponse.json(
        { error: "title, slug, shortDescription, and description are required" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        title,
        slug,
        shortDescription,
        description,
        icon: icon ?? null,
        imageUrl: imageUrl ?? null,
        startingPrice: toNumber(startingPrice),
        currency: currency ?? "EUR",
        deliveryDaysMin: toNumber(deliveryDaysMin),
        deliveryDaysMax: toNumber(deliveryDaysMax),
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    return NextResponse.json({ data: service }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating service", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug must be unique" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
