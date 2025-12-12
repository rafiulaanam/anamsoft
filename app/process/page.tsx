import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import {
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Brush,
  Rocket,
  Send,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { Navbar } from "@/components/navbar";

const steps = [
  {
    title: "Discovery & fit call",
    whatWeDo: [
      "Short 30–45 minute conversation to understand goals and current site gaps.",
      "Decide fit and outline next steps.",
    ],
    whatYouDo: ["Share your business goals and challenges.", "Tell us what a “win” looks like for you."],
  },
  {
    title: "Proposal & planning",
    whatWeDo: [
      "Send a clear proposal with scope, pages, features, timeline, and investment.",
      "Define content responsibilities and milestones.",
    ],
    whatYouDo: ["Review and approve scope.", "Confirm who provides text and photos."],
  },
  {
    title: "Design & structure",
    whatWeDo: [
      "Create sitemap and wireframes for main pages.",
      "Choose visual direction that matches your brand and bookings flow.",
    ],
    whatYouDo: ["Give feedback on structure and style.", "Approve the direction before full build."],
  },
  {
    title: "Development & content",
    whatWeDo: [
      "Build with Next.js, TypeScript, Tailwind, shadcn/ui.",
      "Implement forms, WhatsApp/booking links, and integrate your content.",
    ],
    whatYouDo: ["Provide content or approve draft copy.", "Review staging link and suggest tweaks."],
  },
  {
    title: "Launch & handover",
    whatWeDo: [
      "Performance checks, mobile polish, SEO tags.",
      "Connect domain/hosting/analytics and launch.",
      "Quick video or call on how to request changes.",
    ],
    whatYouDo: ["Approve final version.", "Share domain/hosting access if needed."],
  },
  {
    title: "Support & improvements (optional)",
    whatWeDo: [
      "Ongoing care plan: small updates, backups, monitoring.",
      "Regular check-ins to improve conversions over time.",
    ],
    whatYouDo: ["Send updates/requests as needed.", "Stay in touch for periodic improvements."],
  },
];

const expectationUs = [
  "Clear communication and timelines.",
  "Progress updates at key milestones.",
  "Technical quality: fast, mobile-first, SEO basics included.",
  "Design and structure focused on conversions and bookings.",
];

const expectationYou = [
  "Timely feedback during design and review stages.",
  "Provide text/photos or approve the copy we draft.",
  "Decisions on key options (booking links, contact methods).",
  "Share access for domain/hosting if we’re handling launch.",
];

const timeline = [
  { label: "Week 1", text: "Discovery & planning" },
  { label: "Week 2–3", text: "Design & structure" },
  { label: "Week 3–4", text: "Development & content" },
  { label: "Week 4–6", text: "Review, launch & polishing" },
];

const tools = [
  {
    icon: MessageSquare,
    title: "Communication",
    desc: "Email + WhatsApp for quick answers and updates.",
  },
  {
    icon: ClipboardList,
    title: "Project updates",
    desc: "Milestone updates after discovery, design, and before launch.",
  },
  {
    icon: Sparkles,
    title: "Client portal (optional)",
    desc: "Option to use a simple portal for tasks and updates.",
  },
];

const faqs = [
  {
    q: "What do I need to prepare before we start?",
    a: "Business details, main services, and any existing brand assets. We can guide content if needed.",
  },
  {
    q: "How many revisions are included?",
    a: "We keep revisions lean. Each stage has focused feedback so you get exactly what you need without drag.",
  },
  {
    q: "What if I don’t like the first design?",
    a: "We align early with wireframes and style direction. If something feels off, we adjust before full build.",
  },
  {
    q: "What if I need to pause the project?",
    a: "We can pause; we’ll agree on a revised timeline and any cost impact upfront.",
  },
  {
    q: "Can you help with text and images?",
    a: "Yes. We can draft concise copy and use tasteful stock where needed, or integrate your provided assets.",
  },
];

export default function ProcessPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-16 space-y-16">
        {/* Hero */}
        <section className="space-y-4">
          <Badge variant="outline" className="rounded-full">
            Process
          </Badge>
          <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
            A simple, clear process from idea to launch
          </h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            We keep projects predictable and stress-free for small businesses. Clear steps, one main contact, and no
            surprises—everything agreed before development starts.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/#contact">Start your project</Link>
            </Button>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              Have questions? Email <span className="font-semibold text-slate-800">hello@anamsoft.com</span> or WhatsApp/call{" "}
              <span className="font-semibold text-slate-800">+37061104553</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-blush-600" /> Clear steps and timeline
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm">
              <ClipboardList className="h-4 w-4 text-blush-600" /> One main contact
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm">
              <Brush className="h-4 w-4 text-blush-600" /> No surprises
            </span>
          </div>
        </section>

        {/* Steps */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">How we work together</h2>
            <p className="text-muted-foreground">Six focused steps from discovery to launch and support.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {steps.map((step, idx) => (
              <Card key={step.title} className="rounded-2xl border bg-white shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blush-700">
                    <Badge variant="outline" className="rounded-full">
                      Step {idx + 1}
                    </Badge>
                    <span>{step.title}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <p className="font-semibold text-slate-900">What we do</p>
                    <ul className="mt-1 space-y-1">
                      {step.whatWeDo.map((item) => (
                        <li key={item} className="flex gap-2">
                          <CheckCircle className="h-4 w-4 text-blush-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">What you do</p>
                    <ul className="mt-1 space-y-1">
                      {step.whatYouDo.map((item) => (
                        <li key={item} className="flex gap-2">
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Expectations */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">What to expect</h2>
            <p className="text-muted-foreground">
              We keep communication simple and timelines predictable. Here’s what we bring—and what we need from you.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl border bg-white shadow-sm">
              <CardHeader>
                <CardTitle>From AnamSoft</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {expectationUs.map((item) => (
                  <div key={item} className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-blush-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-2xl border bg-white shadow-sm">
              <CardHeader>
                <CardTitle>From you</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {expectationYou.map((item) => (
                  <div key={item} className="flex gap-2">
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Timeline */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Typical project duration</h2>
            <p className="text-muted-foreground">Timelines vary by scope and response speed, but here’s a typical flow.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {timeline.map((t) => (
              <Card key={t.label} className="rounded-2xl border bg-white shadow-sm">
                <CardHeader className="space-y-1">
                  <Badge variant="outline" className="rounded-full">
                    {t.label}
                  </Badge>
                  <CardDescription className="text-sm text-slate-900">{t.text}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Some projects finish faster; larger builds can take longer. We’ll agree on realistic milestones upfront.
          </p>
        </section>

        {/* Tools & communication */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">How we communicate and manage the project</h2>
            <p className="text-muted-foreground">
              Simple channels, clear updates. We keep you informed without overloading you.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {tools.map((tool) => (
              <Card key={tool.title} className="rounded-2xl border bg-white shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blush-50 px-3 py-1 text-sm font-semibold text-blush-700">
                    <tool.icon className="h-4 w-4" /> {tool.title}
                  </div>
                  <CardDescription>{tool.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Process FAQ</h2>
            <p className="text-muted-foreground">Quick answers to common questions about how we work.</p>
          </div>
          <Accordion
            items={faqs.map((item, idx) => ({
              id: `process-faq-${idx}`,
              question: item.q,
              answer: item.a,
            }))}
          />
        </section>

        {/* Final CTA */}
        <section className="rounded-3xl border bg-white px-6 py-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-slate-900">Ready to start or still have questions?</h3>
              <p className="text-muted-foreground">
                Book a free consultation or send a quick message. We’ll outline the right next steps for your website.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/#contact">
                    Book a free website consultation <ArrowRight className="ml-2 h-4 w-4" />
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
                <CardDescription>Clarity, a realistic plan, and a site built for bookings and conversions.</CardDescription>
              </CardHeader>
              <CardContent className="mt-4 space-y-2 p-0 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-blush-500" />
                  <span>Clear milestones, simple communication, and predictable costs.</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-blush-500" />
                  <span>A partner who designs and builds for real-world results, not just “pretty.”</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
