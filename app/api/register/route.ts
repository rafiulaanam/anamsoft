import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import crypto from "crypto";
import { sendEmailVerificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1";

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export async function POST(req: NextRequest) {
  if (isBuild) {
    return NextResponse.json(
      {
        success: true,
        message: "Registration disabled during build.",
      },
      { status: 200 }
    );
  }
  try {
    const body = await req.json();
    const name = (body?.name as string | undefined)?.trim();
    const email = (body?.email as string | undefined)?.toLowerCase();
    const password = body?.password as string | undefined;

    if (!email || !password || !validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists." }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        hashedPassword,
        role: "USER",
        emailVerified: null,
      },
    });

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    await sendEmailVerificationEmail(user, token).catch((err) =>
      console.error("send verification email failed", err)
    );

    return NextResponse.json({
      success: true,
      message: "Account created. Please check your email to verify your address before signing in.",
    });
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
