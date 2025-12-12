"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const verify = async () => {
      if (!token || !email) {
        setStatus("error");
        setMessage("Verification link is missing or invalid.");
        return;
      }
      setStatus("loading");
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });
        const text = await res.text();
        let data: any = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { error: text || "Unable to parse server response." };
        }
        if (!res.ok) {
          throw new Error(data?.error || "Verification failed.");
        }
        setStatus("success");
        setMessage("Your email has been verified. Redirecting...");
        const target = `/verify-email/success${email ? `?email=${encodeURIComponent(email)}` : ""}`;
        setTimeout(() => router.replace(target), 1000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message || "Verification failed. Please request a new link.");
      }
    };
    verify();
  }, [token, email, router]);

  return (
    <div className="min-h-screen bg-blush-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold text-slate-900">Verify your email</CardTitle>
          <CardDescription>We&apos;re confirming your email so you can sign in securely.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-2 text-slate-700">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>Verifying your email...</p>
            </div>
          )}
        {status === "success" && (
          <div className="flex flex-col items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-6 w-6" />
            <p>{message}</p>
            <p className="text-xs text-muted-foreground">Redirecting to login...</p>
          </div>
        )}
          {status === "error" && (
            <div className="flex flex-col items-center gap-2 text-rose-700">
              <AlertTriangle className="h-6 w-6" />
              <p className="text-sm">{message}</p>
              <Button variant="outline" onClick={() => router.push("/login")} className="mt-2">
                Back to login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
