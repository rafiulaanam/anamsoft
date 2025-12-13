import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import { createAndSendVerificationEmail, VERIFICATION_RESEND_WINDOW_MS } from "@/lib/auth/verification";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email : undefined;
        const password = typeof credentials?.password === "string" ? credentials.password : undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.hashedPassword) return null;

        const isValid = await compare(password, user.hashedPassword);
        if (!isValid) return null;

        if (!user.emailVerified) {
          const result = await createAndSendVerificationEmail({ email: user.email, name: user.name });
          const cooldownSeconds = Math.ceil((result?.retryAfterMs ?? VERIFICATION_RESEND_WINDOW_MS) / 1000);
          throw new Error(`EMAIL_NOT_VERIFIED:${cooldownSeconds}`);
        }

        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
});
