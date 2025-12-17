import { auth } from "@/auth";
import {
  deleteTestimonial,
  getTestimonial,
  updateTestimonial,
} from "@/lib/db/testimonials";
import { TestimonialUpdateSchema } from "@/lib/validators/testimonials";
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
  return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const testimonial = await getTestimonial(params.id);
  if (!testimonial) return notFound();
  return NextResponse.json({ data: testimonial });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const existing = await getTestimonial(params.id);
  if (!existing) return notFound();

  try {
    const body = await req.json();
    const parsed = TestimonialUpdateSchema.parse(body);
    const testimonial = await updateTestimonial(params.id, parsed);
    revalidateTag("testimonials");
    revalidatePath("/");
    return NextResponse.json({ data: testimonial });
  } catch (error) {
    console.error("Failed to update testimonial", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update testimonial" },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const existing = await getTestimonial(params.id);
  if (!existing) return notFound();

  await deleteTestimonial(params.id);
  revalidateTag("testimonials");
  revalidatePath("/");
  return NextResponse.json({ data: { id: params.id } });
}
