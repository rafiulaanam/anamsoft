import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import {
  Rocket,
  MousePointerClick,
  RefreshCcw,
  Wrench,
  Link2,
  Bot,
  Phone,
  Mail,
  ArrowRight,
  ClipboardList,
  Brush,
  Laptop,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

const services = [
  {
    icon: Rocket,
    title: "Conversion-focused websites",
    bullets: [
      "Built for salons, clinics, and local services",
      "Fast, mobile-first, SEO-friendly",
      "Clear calls-to-action and booking prompts",
    ],
  },
  {
    icon: MousePointerClick,
    title: "Landing pages & funnels",
    bullets: [
      "Campaign-ready pages for ads",
      "Lead capture forms and tracking",
      "Structured for clarity and conversions",
    ],
  },
  {
    icon: RefreshCcw,
    title: "Website redesign & migration",
    bullets: [
      "Modernize outdated sites",
      "Improve UX, speed, and accessibility",
      "Migrate from Wix/WordPress to Next.js",
    ],
  },
  {
    icon: Wrench,
    title: "Ongoing support & care plans",
    bullets: [
      "Small updates and content tweaks",
      "Backups and uptime monitoring",
      "Performance and SEO health checks",
    ],
  },
  {
    icon: Link2,
    title: "Technical integrations",
    bullets: [
      "Booking tools, WhatsApp buttons, analytics",
      "Lead routing and email notifications",
      "Contact forms that actually deliver",
    ],
  },
  {
    icon: Bot,
    title: "Automation-ready setup",
    bullets: [
      "Clean structure for future automations",
      "CRM-friendly data capture",
      "Option to add AI chat or lead routing later",
    ],
  },
];

const packages = [
  {
    name: "Starter Website",
    badge: null,
    from: "From €—",
    description: "For solo professionals and very small businesses on a tight budget.",
    bullets: [
      "1–3 pages with simple structure",
      "Mobile-friendly, basic contact form, WhatsApp link",
      "Simple handover without complex CMS",
    ],
  },
  {
    name: "Business Website",
    badge: "Most popular",
    from: "From €—",
    description: "For growing businesses that need to rank and convert visitors into bookings.",
    bullets: [
      "3–7 pages: Home, Services, About, Gallery, Contact, etc.",
      "SEO basics: meta, sitemap, clean structure",
      "Lead capture forms + simple automations (email notifications)",
      "Option to connect to client portal for ongoing care",
    ],
  },
  {
    name: "Premium Website",
    badge: null,
    from: "Custom quote",
    description: "For complex projects that need integrations and custom flows.",
    bullets: [
      "7+ pages, custom sections, richer animations",
      "Booking integrations, multi-language, portal links",
      "Performance-focused and scalable architecture",
    ],
  },
];

const processSteps = [
  { title: "Short call & discovery", desc: "Understand your goals, audience, and required outcomes." },
  { title: "Wireframe & design", desc: "Lay out the structure and visual direction for clarity and speed." },
  { title: "Development & content", desc: "Build, connect forms/booking, and implement your content." },
  { title: "Launch & support", desc: "Deploy, monitor, and iterate with care plan options." },
];

const niches = [
  "Beauty salons, hair & nail studios, barbers",
  "Clinics & wellness professionals",
  "Local services (plumbers, cleaners, electricians)",
  "Small e-commerce & booking sites",
];

const faqs = [
  {
    q: "How long does a website project usually take?",
    a: "Typically 2–4 weeks depending on scope and content readiness.",
  },
  {
    q: "Do I need to have all text and photos ready?",
    a: "If you have them, great. Otherwise we’ll guide structure and you can supply content as we build.",
  },
  {
    q: "Can you help with domain and hosting?",
    a: "Yes. We can advise, set up, or manage hosting and domains for you.",
  },
  {
    q: "Can you update my existing site instead of building new?",
    a: "Often yes. If a refresh works, we’ll propose it; if a rebuild is better, we’ll explain why.",
  },
  {
    q: "Do you offer ongoing support?",
    a: "Yes, with monthly care plans for updates, backups, and optimizations.",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-16">
        {/* Hero */}
        <section className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-full">
              Services
            </Badge>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
              Website & digital services
            </h1>
            <p className="text-lg text-muted-foreground">
              AnamSoft builds modern, fast, mobile-friendly websites and funnels for small businesses—focused on bookings,
              calls, and conversions.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/#contact">Get a free website consultation</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="#packages">See pricing packages</a>
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
          </div>
          <Card className="rounded-3xl border bg-white p-6 shadow-sm">
            <CardHeader className="space-y-2 p-0">
              <CardTitle className="text-lg">What you get</CardTitle>
              <CardDescription>Clean structure, clear CTAs, fast performance, and easy collaboration.</CardDescription>
            </CardHeader>
            <CardContent className="mt-4 space-y-3 p-0">
              <div className="flex items-start gap-3">
                <Laptop className="mt-1 h-5 w-5 text-blush-600" />
                <div>
                  <p className="font-semibold text-slate-900">Modern stack</p>
                  <p className="text-sm text-muted-foreground">Next.js, Tailwind, conversion-focused UI, built to scale.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ClipboardList className="mt-1 h-5 w-5 text-blush-600" />
                <div>
                  <p className="font-semibold text-slate-900">Clear process</p>
                  <p className="text-sm text-muted-foreground">Transparent steps from discovery to launch and support.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Brush className="mt-1 h-5 w-5 text-blush-600" />
                <div>
                  <p className="font-semibold text-slate-900">Tailored design</p>
                  <p className="text-sm text-muted-foreground">Built for your brand, audience, and booking flow.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Core services */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Core services</h2>
            <p className="text-muted-foreground">
              Practical services to launch, modernize, and support websites that win more bookings and leads.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.title} className="rounded-2xl border bg-white shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blush-700">
                    <service.icon className="h-4 w-4" />
                    <span>{service.title}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {service.bullets.map((item) => (
                    <div key={item} className="flex gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blush-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Packages */}
        <section id="packages" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Packages</h2>
            <p className="text-muted-foreground">
              Choose a starting point. We’ll tailor details after a free consultation.
            </p>
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
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {pkg.bullets.map((item) => (
                    <div key={item} className="flex gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blush-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                  <Button asChild className="mt-4 w-full">
                    <Link href="/#contact">Book a consultation</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Not sure which package fits your business? Book a free, no-pressure consultation and we’ll recommend the right
            option.
          </p>
        </section>

        {/* Process */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">How we work</h2>
            <p className="text-muted-foreground">A simple 4-step process from discovery to launch and support.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {processSteps.map((step, idx) => (
              <Card key={step.title} className="rounded-2xl border bg-white shadow-sm">
                <CardHeader className="space-y-2">
                  <Badge variant="outline" className="rounded-full">
                    Step {idx + 1}
                  </Badge>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                  <CardDescription>{step.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Niches */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Who we work with</h2>
            <p className="text-muted-foreground">
              We focus on results: more calls, more bookings, more messages — not just something that looks pretty.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {niches.map((niche) => (
              <Badge key={niche} variant="outline" className="rounded-full bg-white text-sm">
                {niche}
              </Badge>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">FAQ</h2>
            <p className="text-muted-foreground">Clear answers to common questions about timelines, content, and support.</p>
          </div>
          <Accordion
            items={faqs.map((item, idx) => ({
              id: `faq-${idx}`,
              question: item.q,
              answer: item.a,
            }))}
          />
        </section>

        {/* Final CTA */}
        <section className="rounded-3xl border bg-white px-6 py-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-slate-900">Ready to talk about your website?</h3>
              <p className="text-muted-foreground">
                Book a free, no-pressure consultation or send a quick message. We’ll reply with clear next steps.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/#contact">
                    Get a free website consultation <ArrowRight className="ml-2 h-4 w-4" />
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
                <CardTitle className="text-lg">What to expect</CardTitle>
                <CardDescription>No pressure, just clear advice tailored to your business and budget.</CardDescription>
              </CardHeader>
              <CardContent className="mt-4 space-y-2 p-0 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blush-500" />
                  <span>We review your current site or idea and suggest a realistic plan.</span>
                </div>
                <div className="flex gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blush-500" />
                  <span>We’ll keep it simple: timelines, must-haves, and optional extras.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
