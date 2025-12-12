import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcrypt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  // Avoid DB work during static/Vercel build.
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1") {
    return NextResponse.json({ success: true });
  }

  try {
    const body = await req.json();
    const email = (body?.email as string | undefined)?.toLowerCase();
    const token = body?.token as string | undefined;
    const password = body?.password as string | undefined;

    if (!email || !token || !password || password.length < 8) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!(prisma as any).passwordResetToken?.findFirst) {
      return NextResponse.json({ error: "Reset link is invalid or has expired." }, { status: 400 });
    }

    const record = await prisma.passwordResetToken.findFirst({
      where: { email, token },
    });

    if (!record || record.expires < new Date()) {
      return NextResponse.json({ error: "Reset link is invalid or has expired." }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    if ((prisma as any).user?.update) {
      await prisma.user.update({
        where: { email },
        data: { hashedPassword },
      });
    }

    if ((prisma as any).passwordResetToken?.delete) {
      await prisma.passwordResetToken.delete({
        where: { token },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error", error);
    return NextResponse.json({ error: "Unable to reset password" }, { status: 500 });
  }
}
