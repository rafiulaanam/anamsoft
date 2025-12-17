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

function notFound() {
  return NextResponse.json({ error: "Service not found" }, { status: 404 });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const service = await prisma.service.findUnique({ where: { id: params.id } });
    if (!service) return notFound();
    return NextResponse.json({ data: service });
  } catch (error) {
    console.error("Error fetching service", error);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.service.findUnique({ where: { id: params.id } });
    if (!existing) return notFound();

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
      sortOrder,
      metaTitle,
      metaDescription,
      ogImageUrl,
    } = body ?? {};

    const updated = await prisma.service.update({
      where: { id: params.id },
      data: {
        title: title ?? existing.title,
        slug: slug ?? existing.slug,
        shortDescription: shortDescription ?? existing.shortDescription,
        description: description ?? existing.description,
        icon: icon ?? existing.icon,
        imageUrl: imageUrl ?? existing.imageUrl,
        startingPrice:
          toNumber(startingPrice) ?? existing.startingPrice ?? null,
        currency: currency ?? existing.currency,
        deliveryDaysMin: toNumber(deliveryDaysMin) ?? existing.deliveryDaysMin,
        deliveryDaysMax: toNumber(deliveryDaysMax) ?? existing.deliveryDaysMax,
        isActive: typeof isActive === "boolean" ? isActive : existing.isActive,
        sortOrder: toNumber(sortOrder) ?? existing.sortOrder,
        metaTitle: metaTitle ?? existing.metaTitle,
        metaDescription: metaDescription ?? existing.metaDescription,
        ogImageUrl: ogImageUrl ?? existing.ogImageUrl,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error("Error updating service", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug must be unique" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.service.findUnique({ where: { id: params.id } });
    if (!existing) return notFound();

    await prisma.service.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { id: params.id } });
  } catch (error) {
    console.error("Error deleting service", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
