import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { CheckCircle, Phone, Mail, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/navbar";

const packages = [
  {
    name: "Starter Website",
    note: "Best for solo professionals or very small businesses.",
    from: "From €— (custom quote based on scope)",
    features: [
      "1–3 pages (Home, About, Contact)",
      "Mobile-friendly with basic SEO setup",
      "Simple contact form or WhatsApp button",
      "Basic analytics / tracking setup",
    ],
    cta: "Start with Starter",
    href: "/contact?plan=starter",
  },
  {
    name: "Business Website",
    badge: "Most popular",
    note: "For growing businesses that want leads and bookings.",
    from: "From €— (custom quote based on scope)",
    features: [
      "3–7 pages (Home, About, Services, Gallery, Blog, Contact)",
      "Conversion-focused layout with clear CTAs",
      "On-page SEO basics (titles, meta, structure)",
      "Simple automations (email notifications, WhatsApp buttons)",
    ],
    cta: "Talk about Business plan",
    href: "/contact?plan=business",
  },
  {
    name: "Premium Website",
    note: "For complex or high-value projects needing integrations.",
    from: "Custom quote",
    features: [
      "7+ pages, custom layouts and sections",
      "Integrations: booking tools, APIs, multi-language structure",
      "Priority support and performance focus",
      "Scalable and automation-ready",
    ],
    cta: "Discuss Premium project",
    href: "/contact?plan=premium",
  },
];

const comparisonRows = [
  { feature: "Number of pages", starter: "Up to 3", business: "Up to 7", premium: "Custom" },
  { feature: "Mobile-friendly responsive design", starter: "Included", business: "Included", premium: "Included" },
  { feature: "On-page SEO basics", starter: "Included", business: "Included", premium: "Included" },
  { feature: "Contact forms & WhatsApp buttons", starter: "Included", business: "Included", premium: "Included" },
  { feature: "Blog/news section", starter: "Optional", business: "Included", premium: "Included" },
  { feature: "Integrations (booking/CRM)", starter: "Optional", business: "Optional", premium: "Custom" },
  { feature: "Ongoing support options", starter: "Available", business: "Available", premium: "Available" },
];

const pricingFaqs = [
  { q: "Can I pay in installments?", a: "Yes. Typical structure is 50% to start and 50% at launch." },
  {
    q: "What happens if I need more pages later?",
    a: "We can add more pages as your business grows and adjust the quote accordingly.",
  },
  { q: "Do you charge extra for changes?", a: "Small tweaks in scope are fine; bigger changes are discussed and approved first." },
  { q: "Do I have to pay for hosting and domain separately?", a: "Yes. We can set up hosting/domain and advise on the best options." },
  {
    q: "Can you work with an existing design or template?",
    a: "Yes. We can adapt or refresh an existing design and modernize the build.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-16">
        {/* Hero */}
        <section className="space-y-4">
          <Badge variant="outline" className="rounded-full">
            Pricing
          </Badge>
          <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
            Simple, transparent website pricing
          </h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            Every project is customized, but here are three clear packages so you know what to expect. No hidden fees,
            clear scope before starting, designed for small business budgets.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/#contact">Get a custom quote</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="#compare">Compare plans</a>
            </Button>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              Prefer WhatsApp / call? <span className="font-semibold text-slate-800">+37061104553</span>
            </p>
            <p>
              Email: <span className="font-semibold text-slate-800">hello@anamsoft.com</span>
            </p>
          </div>
        </section>

        {/* Packages */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Packages for different needs</h2>
            <p className="text-muted-foreground">Pick a starting point. We’ll tailor scope after a quick consultation.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={`rounded-2xl border bg-white shadow-sm ${
                  pkg.badge ? "border-blush-200 shadow-md" : ""
                }`}
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    {pkg.badge && <Badge className="rounded-full bg-blush-100 text-blush-700">{pkg.badge}</Badge>}
                  </div>
                  <CardDescription className="text-base font-semibold text-slate-900">{pkg.from}</CardDescription>
                  <CardDescription>{pkg.note}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {pkg.features.map((item) => (
                    <div key={item} className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-blush-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                  <Button asChild className="mt-4 w-full">
                    <a href={pkg.href}>{pkg.cta}</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Comparison */}
        <section id="compare" className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Compare what’s included</h2>
            <p className="text-muted-foreground">A quick view of differences across Starter, Business, and Premium.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3">Starter</th>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-800">
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="align-top">
                    <td className="px-4 py-3 text-slate-700">{row.feature}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.starter}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.business}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* How pricing works */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">How we price projects</h2>
            <p className="text-muted-foreground">Transparent steps and a simple payment structure.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Quick discovery",
                desc: "We start with a short call to understand goals, scope, and what success looks like.",
              },
              {
                title: "Clear proposal",
                desc: "You receive a fixed-price or estimated range with clear inclusions before we begin.",
              },
              {
                title: "No surprises",
                desc: "Any extra work is discussed and approved first. Typical split: 50% start, 50% launch.",
              },
            ].map((item) => (
              <Card key={item.title} className="rounded-2xl border bg-white shadow-sm">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Add-ons */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Add-ons & ongoing care</h2>
            <p className="text-muted-foreground">Optional extras you can add during the consultation.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Monthly website care",
                desc: "Updates, backups, uptime monitoring, and small content changes.",
              },
              {
                title: "SEO & content support",
                desc: "On-page refinements, lightweight content help, and search visibility checks.",
              },
              {
                title: "Extra landing pages",
                desc: "Campaign-ready pages for ads or seasonal promos.",
              },
              {
                title: "Advanced analytics / tracking",
                desc: "Better event tracking, dashboards, and reporting setups.",
              },
              {
                title: "Integrations & automations",
                desc: "Booking tools, CRM links, or small custom tools to streamline workflows.",
              },
            ].map((item) => (
              <Card key={item.title} className="rounded-2xl border bg-white shadow-sm">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Pricing FAQ</h2>
            <p className="text-muted-foreground">
              Clear answers about payments, changes, and what’s included.
            </p>
          </div>
          <Accordion
            items={pricingFaqs.map((item, idx) => ({
              id: `pricing-faq-${idx}`,
              question: item.q,
              answer: item.a,
            }))}
          />
        </section>

        {/* Final CTA */}
        <section className="rounded-3xl border bg-white px-6 py-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-slate-900">Not sure which package is right for you?</h3>
              <p className="text-muted-foreground">
                Book a free pricing consultation or send a quick message. We’ll recommend the best fit for your goals and budget.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/#contact">
                    Get a free pricing consultation <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="mailto:hello@anamsoft.com">Email us</a>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" /> Call / WhatsApp: +37061104553
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" /> hello@anamsoft.com
                </span>
              </div>
            </div>
            <Card className="rounded-2xl border bg-muted/40 p-4">
              <CardHeader className="p-0">
                <CardTitle className="text-lg">What you’ll get</CardTitle>
                <CardDescription>Clear timelines, transparent scope, and no-pressure guidance.</CardDescription>
              </CardHeader>
              <CardContent className="mt-4 space-y-2 p-0 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-blush-500" />
                  <span>We review your needs and send a straightforward proposal.</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-blush-500" />
                  <span>We keep costs predictable; any extras are agreed before work starts.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
