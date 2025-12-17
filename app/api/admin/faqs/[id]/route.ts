import { auth } from "@/auth";
import { deleteFaq, getFaq, updateFaq } from "@/lib/db/faqs";
import { FaqUpdateSchema } from "@/lib/validators/faqs";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function notFound() {
  return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const faq = await getFaq(params.id);
  if (!faq) return notFound();
  return NextResponse.json({ data: faq });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const existing = await getFaq(params.id);
  if (!existing) return notFound();

  try {
    const body = await req.json();
    const parsed = FaqUpdateSchema.parse(body);
    const faq = await updateFaq(params.id, parsed);
    revalidateTag("faqs");
    revalidatePath("/");
    return NextResponse.json({ data: faq });
  } catch (error) {
    console.error("Failed to update FAQ", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update FAQ" },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const existing = await getFaq(params.id);
  if (!existing) return notFound();

  await deleteFaq(params.id);
  revalidateTag("faqs");
  revalidatePath("/");
  return NextResponse.json({ data: { id: params.id } });
}
