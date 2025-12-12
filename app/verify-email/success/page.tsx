"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function VerifyEmailSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-blush-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-soft text-center">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold text-slate-900">Your account is verified</CardTitle>
          <CardDescription>
            {email ? `The email ${email} is now verified.` : "Your email is now verified."} Redirecting to login...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" />
        </CardContent>
      </Card>
    </div>
  );
}
