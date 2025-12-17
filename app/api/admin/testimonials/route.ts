import { auth } from "@/auth";
import { createTestimonial, listTestimonials, TestimonialFilter, TestimonialSort } from "@/lib/db/testimonials";
import { TestimonialCreateSchema } from "@/lib/validators/testimonials";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? undefined;
  const filter = (url.searchParams.get("filter") ?? "all") as TestimonialFilter;
  const sort = (url.searchParams.get("sort") ?? "sortOrder") as TestimonialSort;
  const direction = (url.searchParams.get("direction") as "asc" | "desc") ?? undefined;
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "20");

  const data = await listTestimonials({ search, filter, sort, direction, page, pageSize });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const parsed = TestimonialCreateSchema.parse(body);
    const testimonial = await createTestimonial(parsed);
    revalidateTag("testimonials");
    revalidatePath("/");
    return NextResponse.json({ data: testimonial }, { status: 201 });
  } catch (error) {
    console.error("Failed to create testimonial", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create testimonial" },
      { status: 400 }
    );
  }
}
