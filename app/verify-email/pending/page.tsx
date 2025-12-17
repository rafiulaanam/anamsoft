"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail, RefreshCw } from "lucide-react";

const COOLDOWN_SECONDS = 60;

function inboxLink(email: string) {
  const domain = email.split("@")[1];
  if (!domain) return `mailto:${email}`;
  const lower = domain.toLowerCase();
  if (lower.includes("gmail")) return "https://mail.google.com";
  if (lower.includes("outlook") || lower.includes("live") || lower.includes("hotmail"))
    return "https://outlook.live.com";
  if (lower.includes("yahoo")) return "https://mail.yahoo.com";
  return `mailto:${email}`;
}

export default function VerifyEmailPendingPage() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState<string | null>(
    initialEmail
      ? `We’ve sent a verification link to ${initialEmail}. Please verify to finish setting up your account.`
      : "We sent a verification link to your email. Please verify to finish setting up your account."
  );
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const disabled = useMemo(() => cooldown > 0, [cooldown]);
  const autoResent = useRef(false);

  const handleResend = useCallback(
    async (silent?: boolean) => {
      setError(null);
      if (!silent) setMessage(null);
      if (!email) {
        setError("Enter your email to resend the verification link.");
        return;
      }
      try {
        const res = await fetch("/api/auth/resend-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || "Could not resend verification email.");
        }
        const retryMs = typeof data?.cooldownMs === "number" ? data.cooldownMs : COOLDOWN_SECONDS * 1000;
        setCooldown(Math.ceil(retryMs / 1000));
        setMessage(`Verification email sent to ${email}. Check your inbox.`);
      } catch (err: any) {
        setError(err?.message || "Could not resend verification email.");
      }
    },
    [email]
  );

  useEffect(() => {
    if (errorParam === "invalid") {
      setError("Verification link is invalid or expired. We’ve sent a new link, or you can resend below.");
      if (email && !autoResent.current) {
        autoResent.current = true;
        void handleResend(true);
      }
    }
  }, [errorParam, email, handleResend]);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 1 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const inboxHref = inboxLink(email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-xl shadow-lg border border-pink-100/70">
        <CardHeader>
          <CardTitle className="text-2xl">Check your inbox</CardTitle>
          <p className="text-sm text-slate-600">
            We’ve sent a verification link to {email || "your email"}. Please verify to finish setting up your account.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && <p className="rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">{message}</p>}
          {error && <p className="rounded-lg bg-rose-50 text-rose-700 px-3 py-2 text-sm">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild className="w-full">
              <a href={inboxHref} target="_blank" rel="noreferrer">
                <Mail className="h-4 w-4 mr-2" />
                Open my inbox
              </a>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">Go to login</Link>
            </Button>
          </div>

          <Button
            onClick={() => handleResend()}
            disabled={disabled}
            className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white"
          >
            {disabled ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Resend available in {cooldown}s
              </>
            ) : (
              "Resend verification email"
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-slate-600">
          <Link href="/contact" className="text-pink-600 hover:text-pink-700">
            Still no email? Contact support →
          </Link>
          <span>If you don’t see it, check spam/junk.</span>
        </CardFooter>
      </Card>
    </div>
  );
}
