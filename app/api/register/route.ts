import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export async function POST(req: NextRequest) {
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
    await prisma.user.create({
      data: {
        name: name || null,
        email,
        hashedPassword,
        role: "USER",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
