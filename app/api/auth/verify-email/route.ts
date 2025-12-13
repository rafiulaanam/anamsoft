import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";
  const email = (searchParams.get("email") ?? "").toLowerCase();

  if (!token || !email) {
    return NextResponse.redirect(new URL("/login?verify=invalid", req.url));
  }

  try {
    const candidates = await prisma.verificationToken.findMany({
      where: { identifier: email, expires: { gt: new Date() } },
      orderBy: { expires: "desc" },
    });

    const record = await (async () => {
      for (const rec of candidates) {
        if (rec.token === token) return rec; // legacy plain token support
        if (await bcrypt.compare(token, rec.token)) return rec;
      }
      return null;
    })();

    if (!record) {
      return NextResponse.redirect(
        new URL(
          `/verify-email/pending?email=${encodeURIComponent(email)}&error=invalid`,
          req.url
        )
      );
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return NextResponse.redirect(
      new URL(`/verify-email/success?verified=1&email=${encodeURIComponent(email)}`, req.url)
    );
  } catch (error) {
    console.error("Verify email error", error);
    return NextResponse.redirect(
      new URL("/verify-email/pending?error=invalid", req.url)
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token : "";
    const email = typeof body?.email === "string" ? body.email.toLowerCase() : "";

    if (!token || !email) {
      return NextResponse.json({ error: "Verification link is missing or invalid." }, { status: 400 });
    }

    const candidates = await prisma.verificationToken.findMany({
      where: { identifier: email, expires: { gt: new Date() } },
      orderBy: { expires: "desc" },
    });

    let match = null;
    for (const rec of candidates) {
      if (rec.token === token || (await bcrypt.compare(token, rec.token))) {
        match = rec;
        break;
      }
    }

    if (!match) {
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
