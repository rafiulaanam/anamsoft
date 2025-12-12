"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function ConsultationBookingSection() {
  const rawBookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;
  const bookingUrl = rawBookingUrl && rawBookingUrl.trim().length > 0 ? rawBookingUrl : null;

  return (
    <section id="consultation" className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="space-y-2 text-center">
          <Badge variant="outline" className="rounded-full px-3">
            Free consultation
          </Badge>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Book a 20-minute website consultation
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We&apos;ll look at your current situation, your salon&apos;s goals, and I&apos;ll suggest the easiest next steps to get more bookings from your website.
          </p>
        </div>

        <Card className="rounded-3xl border shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle>Pick a time that works for you</CardTitle>
            <CardDescription>
              All calls are online (Google Meet / Zoom). No pressure—just practical advice for your salon.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {bookingUrl ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Use the scheduler below to choose a time. You&apos;ll get a calendar invite and reminder automatically.
                </p>
                <div className="w-full rounded-2xl border bg-muted/40 p-2">
                  <iframe
                    src={bookingUrl}
                    className="w-full h-[520px] rounded-xl border-0"
                    loading="lazy"
                    title="Book a free consultation with AnamSoft"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Booking link isn&apos;t configured yet. Once Calendly, TidyCal, or another tool is connected, visitors will be able to pick a time directly here.
                </p>
                <p className="text-sm text-muted-foreground">
                  For now, they can still reach out via the contact form or WhatsApp.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-xs text-muted-foreground">
              Tip: after booking, add the event to your personal calendar so you don&apos;t forget.
            </p>
            {bookingUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={bookingUrl} target="_blank" rel="noreferrer">
                  Open scheduler in a new tab
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
