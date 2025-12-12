"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function VerifyEmailPendingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const inboxUrl = useMemo(() => {
    if (!email) return "";
    const domain = email.split("@")[1]?.toLowerCase();
    switch (domain) {
      case "gmail.com":
        return "https://mail.google.com";
      case "outlook.com":
      case "hotmail.com":
      case "live.com":
      case "msn.com":
        return "https://outlook.live.com/mail/0/inbox";
      case "yahoo.com":
      case "yahoo.co.uk":
        return "https://mail.yahoo.com";
      case "icloud.com":
        return "https://www.icloud.com/mail";
      default:
        return `mailto:${email}`;
    }
  }, [email]);

  return (
    <div className="min-h-screen bg-blush-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold text-slate-900">Check your inbox</CardTitle>
          <CardDescription>
            We’ve sent a verification link to {email || "your email"}. Please verify to finish setting up your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="flex flex-col items-center gap-2 text-slate-700">
            <MailCheck className="h-8 w-8 text-blush-600" />
            <p className="text-sm text-muted-foreground">
              Open the email and click “Verify my email”. If you don’t see it, check spam or request a new link from the
              login page.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {email && (
              <Button asChild className="w-full">
                <a href={inboxUrl} target="_blank" rel="noreferrer">
                  Open my inbox
                </a>
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
              Go to login
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/contact">
                Still no email? Contact support <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
