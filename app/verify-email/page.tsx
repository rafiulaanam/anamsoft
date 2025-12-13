"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const verifiedFlag = searchParams.get("verified");
  const token = searchParams.get("token");
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState<string | null>(
    "Your email is not verified. We sent a verification link to your inbox."
  );
  const [verifiedMsg, setVerifiedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const disabled = useMemo(() => cooldown > 0, [cooldown]);
  const [verifying, setVerifying] = useState<boolean>(false);

  // If a token is present (older email links), forward to the API verifier to complete verification.
  useEffect(() => {
    if (token) {
      setVerifying(true);
      setMessage("Verifying your email...");
      setError(null);
      const params = new URLSearchParams();
      params.set("token", token);
      if (email) params.set("email", email);
      window.location.href = `/api/auth/verify-email?${params.toString()}`;
    }
  }, [token, email]);

  // If we come here with ?verified=1, redirect to the success page UI.
  useEffect(() => {
    if (verifiedFlag === "1") {
      window.location.href = `/verify-email/success?email=${encodeURIComponent(initialEmail)}`;
    }
  }, [verifiedFlag, initialEmail]);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 1 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setError(null);
    setMessage(null);
    if (!email) {
      setError("Enter your email to resend verification.");
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
        throw new Error(data?.error || "Failed to resend verification email.");
      }
      setMessage("Verification email sent. Check your inbox.");
      const retryMs = typeof data?.cooldownMs === "number" ? data.cooldownMs : COOLDOWN_SECONDS * 1000;
      setCooldown(Math.ceil(retryMs / 1000));
    } catch (err: any) {
      setError(err?.message || "Could not resend verification email.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-xl shadow-lg border border-pink-100/70">
        <CardHeader>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <p className="text-sm text-slate-600">
            We need to confirm your email before you can sign in. Click the link we sent, or resend it below.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {verifying && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-100 text-slate-700 px-3 py-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span>Verifying your email...</span>
            </div>
          )}
          {verifiedMsg && <p className="rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">{verifiedMsg}</p>}
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
          <Button onClick={handleResend} disabled={disabled} className="w-full">
            {disabled ? `Resend available in ${cooldown}s` : "Resend verification email"}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-slate-600">
          <Link href="/login" className="text-pink-600 hover:text-pink-700">
            Back to login
          </Link>
          <span>If you don’t see it, check spam/junk.</span>
        </CardFooter>
      </Card>
    </div>
  );
}
