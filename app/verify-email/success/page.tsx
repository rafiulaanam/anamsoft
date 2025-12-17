"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const VERIFIED_SUCCESS_URL =
  process.env.NEXT_PUBLIC_VERIFIED_SUCCESS_URL ?? "/login?verified=1";

export default function VerifyEmailSuccessPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = VERIFIED_SUCCESS_URL;
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center shadow-lg border border-pink-100/70">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Your account is verified</CardTitle>
          <p className="text-sm text-slate-600">
            {email ? `The email ${email} is now verified.` : "Your email is now verified."} Redirecting to login...
          </p>
        </CardHeader>
        <CardContent className="space-y-4 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-xs text-slate-500">
            Not redirected? <Link href={VERIFIED_SUCCESS_URL} className="text-pink-600 hover:text-pink-700">Go to login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
