import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const body = await req.json();

    const data: any = {};
    if (body.sku !== undefined) data.sku = body.sku;
    if (body.asin !== undefined) data.asin = body.asin;
    if (body.title !== undefined) data.title = body.title;
    if (body.marketplace !== undefined) data.marketplace = body.marketplace;
    if (body.fulfillmentType !== undefined) data.fulfillmentType = body.fulfillmentType;
    if (body.status !== undefined) data.status = body.status;
    if (body.costPrice !== undefined) data.costPrice = body.costPrice !== null ? Number(body.costPrice) : null;
    if (body.sellPrice !== undefined) data.sellPrice = body.sellPrice !== null ? Number(body.sellPrice) : null;
    if (body.currency !== undefined) data.currency = body.currency;
    if (body.stockQty !== undefined) data.stockQty = body.stockQty !== null ? Number(body.stockQty) : null;
    if (body.reorderLevel !== undefined) data.reorderLevel = body.reorderLevel !== null ? Number(body.reorderLevel) : null;
    if (body.notes !== undefined) data.notes = body.notes;

    const updated = await prisma.amazonProduct.update({ where: { id }, data });
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("/api/admin/business/products/[id] PATCH error", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    await prisma.amazonProduct.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    console.error("/api/admin/business/products/[id] DELETE error", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
