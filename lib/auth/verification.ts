import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendEmailVerificationEmail } from "@/lib/email";

const VERIFICATION_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour
const VERIFICATION_RESEND_WINDOW_MS = 1000 * 60; // 60 seconds

function now() {
  return Date.now();
}

export async function canResendVerification(identifier: string) {
  const recent = await prisma.verificationToken.findFirst({
    where: { identifier },
    orderBy: { expires: "desc" },
  });

  if (!recent) return { allowed: true, retryAfterMs: 0 };

  // Derive an approximate created time using expiry minus TTL since older records may lack createdAt.
  const createdTime =
    (recent as any).createdAt instanceof Date
      ? (recent as any).createdAt.getTime()
      : recent.expires.getTime() - VERIFICATION_TOKEN_TTL_MS;
  const elapsed = now() - createdTime;
  if (elapsed < VERIFICATION_RESEND_WINDOW_MS) {
    return { allowed: false, retryAfterMs: VERIFICATION_RESEND_WINDOW_MS - elapsed };
  }
  return { allowed: true, retryAfterMs: 0 };
}

export async function createAndSendVerificationEmail(user: { email: string; name?: string | null }) {
  const identifier = user.email.toLowerCase();
  const { allowed } = await canResendVerification(identifier);
  if (!allowed) return { sent: false, retryAfterMs: VERIFICATION_RESEND_WINDOW_MS };

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(rawToken, 10);
  const expires = new Date(now() + VERIFICATION_TOKEN_TTL_MS);

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashedToken,
      expires,
    },
  });

  await sendEmailVerificationEmail(user, rawToken);
  return { sent: true, retryAfterMs: VERIFICATION_RESEND_WINDOW_MS };
}

export async function validateVerificationToken(email: string, token: string) {
  const identifier = email.toLowerCase();
  const candidates = await prisma.verificationToken.findMany({
    where: { identifier, expires: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  for (const record of candidates) {
    const matches = await bcrypt.compare(token, record.token);
    if (matches) {
      return record;
    }
  }
  return null;
}

export { VERIFICATION_RESEND_WINDOW_MS };
