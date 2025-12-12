"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Sparkles, Github, Mail } from "lucide-react";
import { AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setSuccess("Your email has been verified. You can now sign in.");
    } else if (searchParams.get("reset") === "1") {
      setSuccess("Password reset successfully. You can now sign in.");
    } else if (searchParams.get("verify") === "invalid") {
      setError("Verification link is invalid or expired. Please request a new one.");
    }
  }, [searchParams]);

  // If already authenticated, redirect away from login
  useEffect(() => {
    if (status === "authenticated") {
      const role = session?.user?.role;
      if (role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [status, session, router]);

  if (status === "authenticated") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError(result.error || "Invalid credentials");
      setResendMessage(null);
      setLoading(false);
      return;
    }

    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;
      if (role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (_err) {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(219,39,119,0.08),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.08),transparent_25%)]" />
      <Card className="relative w-full max-w-lg shadow-xl border border-pink-100/70">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-semibold text-slate-900">Welcome back to AnamSoft</CardTitle>
          <p className="text-sm text-slate-600">Sign in to manage projects, leads, and settings.</p>
        </CardHeader>
          <CardContent className="space-y-4">
            {success && <p className="text-sm rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2">{success}</p>}
          {error && <p className="text-sm rounded-lg bg-rose-50 text-rose-700 px-3 py-2">{error}</p>}
          {resendMessage && <p className="text-sm rounded-lg bg-amber-50 text-amber-700 px-3 py-2">{resendMessage}</p>}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@anamsoft.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-pink-600 hover:text-pink-700">
                Forgot password?
              </Link>
            </div>
            {error?.toLowerCase().includes("verify") && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                <div className="flex flex-col gap-1">
                  <p>Email not verified.</p>
                  <button
                    type="button"
                    className="underline text-amber-800"
                    onClick={async () => {
                      if (!email) {
                        setResendMessage("Enter your email above, then click resend.");
                        return;
                      }
                      setResendMessage(null);
                      try {
                        const res = await fetch("/api/auth/resend-verification", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email }),
                        });
                        if (!res.ok) {
                          throw new Error("Failed to resend verification email.");
                        }
                        setResendMessage("Verification email sent. Please check your inbox.");
                      } catch (err: any) {
                        setResendMessage(err?.message || "Could not resend verification email.");
                      }
                    }}
                  >
                    Resend verification email
                  </button>
                </div>
              </div>
            )}
            <Button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md hover:from-pink-600 hover:to-purple-600"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Log In"}
            </Button>
          </form>

          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="h-px flex-1 bg-slate-200" />
            <span>or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" type="button">
              <Mail className="h-4 w-4 mr-2" />
              Email link
            </Button>
            <Button variant="outline" className="w-full" type="button">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <p className="text-sm text-center text-slate-700">
            New to AnamSoft?{" "}
            <Link href="/register" className="text-pink-600 hover:text-pink-700 font-semibold">
              Create an account
            </Link>
          </p>
          <p className="text-xs text-center text-slate-500">For admins and team members only.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
