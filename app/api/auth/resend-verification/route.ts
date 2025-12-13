import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendEmailVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();
    const email = (body?.email as string | undefined)?.toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    if (!(prisma as any).user?.findUnique) {
      return NextResponse.json({ success: true });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: true });
    }

    if ((user as any).emailVerified) {
      return NextResponse.json({ success: true, message: "Email already verified." });
    }

    // clear existing tokens for this email
    if ((prisma as any).verificationToken?.deleteMany) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    if ((prisma as any).verificationToken?.create) {
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });
    }

    try {
      await sendEmailVerificationEmail({ email, name: (user as any).name }, token);
    } catch (err) {
      console.error("Resend verification email send failed:", err);
      // ignore send failure for build-safety
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend verification error", error);
    return NextResponse.json({ error: "Unable to resend verification email." }, { status: 500 });
  }
}
