import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Navbar } from "@/components/navbar";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 px-4 py-20 text-center">
        <Card className="w-full rounded-3xl border p-6 shadow-sm">
          <CardHeader className="space-y-2 p-0">
            <CardTitle className="text-3xl font-semibold text-slate-900">
              <span className="inline-flex items-center gap-2">
                <Check className="h-6 w-6 text-emerald-500" />
                Thanks for your message
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4 text-sm text-slate-600">
            <p>
              I’ll review your brief and reply within one working day with next steps or a few clarifying questions.
            </p>
            <p className="mt-3">
              In the meantime, feel free to browse recent projects or book a call directly.
            </p>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Submit another request</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
