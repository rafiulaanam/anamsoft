import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  // Avoid DB work during static/Vercel build.
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1") {
    return NextResponse.redirect(new URL("/login?verify=invalid", req.url));
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";
  const email = (searchParams.get("email") ?? "").toLowerCase();

  if (!token || !email) {
    return NextResponse.redirect(new URL("/login?verify=invalid", req.url));
  }

  try {
    const record = await prisma.verificationToken.findFirst({
      where: { identifier: email, token },
    });

    if (!record || record.expires < new Date()) {
      return NextResponse.redirect(new URL("/login?verify=invalid", req.url));
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return NextResponse.redirect(new URL("/login?verified=1", req.url));
  } catch (error) {
    console.error("Verify email error", error);
    return NextResponse.redirect(new URL("/login?verify=error", req.url));
  }
}

export async function POST(req: Request) {
  // Avoid DB work during static/Vercel build.
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1") {
    return NextResponse.json({ success: true });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token : "";
    const email = typeof body?.email === "string" ? body.email.toLowerCase() : "";

    if (!token || !email) {
      return NextResponse.json({ error: "Verification link is missing or invalid." }, { status: 400 });
    }

    const record = await prisma.verificationToken.findFirst({
      where: { identifier: email, token },
    });

    if (!record || record.expires < new Date()) {
      return NextResponse.json({ error: "Verification link is invalid or expired." }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify email error", error);
    return NextResponse.json({ error: "Unable to verify email." }, { status: 500 });
  }
}
