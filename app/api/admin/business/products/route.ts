import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const business = await prisma.business.findFirst();
    if (!business) return NextResponse.json({ data: [] });
    const products = await prisma.amazonProduct.findMany({ where: { businessId: business.id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ data: products });
  } catch (err) {
    console.error("/api/admin/business/products GET error", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.sku || !body.title || !body.fulfillmentType) {
      return NextResponse.json({ error: "sku, title and fulfillmentType required" }, { status: 400 });
    }

    const business = await prisma.business.findFirst();
    if (!business) return NextResponse.json({ error: "No business configured" }, { status: 400 });

    const prod = await prisma.amazonProduct.create({
      data: {
        businessId: business.id,
        sku: body.sku,
        asin: body.asin,
        marketplace: body.marketplace,
        title: body.title,
        fulfillmentType: body.fulfillmentType,
        status: body.status || undefined,
        costPrice: body.costPrice ? Number(body.costPrice) : undefined,
        sellPrice: body.sellPrice ? Number(body.sellPrice) : undefined,
        currency: body.currency,
        stockQty: body.stockQty ? Number(body.stockQty) : undefined,
        reorderLevel: body.reorderLevel ? Number(body.reorderLevel) : undefined,
        notes: body.notes,
      },
    });

    return NextResponse.json({ data: prod }, { status: 201 });
  } catch (err) {
    console.error("/api/admin/business/products POST error", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
