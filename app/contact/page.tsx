import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, ArrowRight, Send } from "lucide-react";
import { LeadCaptureForm } from "@/components/sections/lead-capture-form";
import type { Service } from "@prisma/client";
import { Navbar } from "@/components/navbar";
import { getSiteConfig, getPublishedServices } from "@/lib/content/public";

export default async function ContactPage() {
  const siteConfig = await getSiteConfig();
  let services: Service[] = [];
  try {
    services = await getPublishedServices();
  } catch (error) {
    console.error("Failed to load services for contact page", error);
  }

  const serviceOptions = services.map((service) => ({ id: service.id, label: service.title }));
  const email = siteConfig?.email ?? "hello@anamsoft.com";
  const whatsapp = siteConfig?.whatsapp ?? "+37061104553";
  const whatsappHref = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;

  return (
    <main className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-12">
        {/* Hero */}
        <section className="space-y-4">
          <Badge variant="outline" className="rounded-full">
            Contact
          </Badge>
          <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
            Let’s talk about your website
          </h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            Use this form to start a new website, redesign, or ask any questions. I’ll reply quickly with clear next steps.
          </p>
        </section>

        {/* Content grid */}
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card className="rounded-2xl border bg-white shadow-sm">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg">Contact details</CardTitle>
                <CardDescription>Based in Vilnius, working with clients remotely.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blush-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <a href={`mailto:${email}`} className="text-blush-700 hover:underline">
                      {email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blush-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Call / WhatsApp</p>
                    <a href={whatsappHref} className="text-blush-700 hover:underline">
                      {whatsapp}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blush-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Location</p>
                    <p>Vilnius, Lithuania (working online with clients)</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">You can message us if…</p>
                  <ul className="space-y-1 list-disc pl-4">
                    <li>You’re opening a new business and need a modern site.</li>
                    <li>You already have a site but it’s slow or confusing.</li>
                    <li>You need help deciding what to build first.</li>
                  </ul>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Send className="h-4 w-4 text-blush-600" />
                  <span>We reply within one business day.</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-white shadow-sm">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg">What happens next?</CardTitle>
                <CardDescription>Simple, predictable steps after you submit the form.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blush-500" />
                  <span>We review your message and check if we’re a good fit.</span>
                </div>
                <div className="flex gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blush-500" />
                  <span>We reply (usually within 24 hours) with a few clarifying questions.</span>
                </div>
                <div className="flex gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blush-500" />
                  <span>If it makes sense, we schedule a short call to discuss details.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border bg-white p-6 shadow-sm">
            <CardHeader className="space-y-2 p-0">
              <CardTitle className="text-lg">Tell me about your project</CardTitle>
              <CardDescription>Share a few details and I’ll reply within 24 hours.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <LeadCaptureForm
                serviceOptions={serviceOptions}
                source="contact_page"
                submitLabel="Send project details"
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
