import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocalBusinessSchema } from "@/components/seo/local-business-schema";
import { CalendarClock, Palette, Sparkles, Workflow, Check } from "lucide-react";
import { ContactSection } from "@/components/sections/contact-section";
import { Navbar } from "@/components/navbar";
import { PricingSection } from "@/components/sections/pricing-section";
import { ProjectEstimatorWizard } from "@/components/sections/project-estimator-wizard";
import { ConsultationBookingSection } from "@/components/sections/consultation-booking-section";
import { ScrollArea, ScrollBar, ScrollAreaViewport } from "@/components/ui/scroll-area";


const steps = [
  {
    title: "Quick call or chat",
    desc: "We talk about your salon, services, and what your website should do (more bookings, better image, etc.).",
    icon: CalendarClock,
  },
  {
    title: "Content & structure",
    desc: "I help you organise your services, prices, and photos into a clear structure and navigation.",
    icon: Workflow,
  },
  {
    title: "Design & build",
    desc: "I design and develop a fast, mobile-friendly website that matches your brand and style.",
    icon: Palette,
  },
  {
    title: "Launch & support",
    desc: "I put the site live on your domain, connect booking links, and support you with small updates after launch.",
    icon: Sparkles,
  },
];

const faqs = [
  {
    id: "timeline",
    question: "How long does it take to build a website?",
    answer:
      "Most salon websites take between 7–14 days after we finalise your content (text, photos and services). Larger projects may take longer.",
  },
  {
    id: "tech",
    question: "Do I need to know anything technical?",
    answer:
      "No. I handle the technical side – domain, hosting, deployment. You just provide your salon information, services, prices and photos.",
  },
  {
    id: "updates",
    question: "Can you update my site later if my prices or services change?",
    answer:
      "Yes. I offer simple update options and monthly care plans if you want me to handle changes for you.",
  },
  {
    id: "location",
    question: "Do you work only with salons in Vilnius?",
    answer:
      "I’m based in Vilnius and know the local market well, but I can work with salons and spas in other cities and countries as long as we can talk online.",
  },
];

const testimonials = [
  {
    name: "Laura",
    salon: "Lash & Brow Studio",
    quote:
      "The site looks elegant and makes it easy for clients to book from their phones. We had bookings coming in the first week after launch.",
  },
  {
    name: "Eglė",
    salon: "Vilnius Salon",
    quote: "Clear process, great communication, and a website that finally reflects our services.",
  },
  {
    name: "Monika",
    salon: "Old Town Spa",
    quote: "Our spa packages are clearer and clients love how easy it is to schedule online.",
  },
];

const fallbackPortfolio = [
  {
    id: "fallback-p1",
    title: "Vilnius Lash & Brow Studio",
    type: "Lash & Brow Studio",
    description:
      "Clean, mobile-first site with service list, gallery, and clear book-now buttons tied to the studio’s booking system.",
    demoUrl: "#",
  },
  {
    id: "fallback-p2",
    title: "Old Town Spa & Wellness",
    type: "Day Spa",
    description: "Calming site with spa packages, treatments overview, gift vouchers, and directions for visitors.",
    demoUrl: "#",
  },
  {
    id: "fallback-p3",
    title: "Naujamiestis Hair & Nail Studio",
    type: "Hair & Nail Salon",
    description: "Modern site combining hair and nail services, price list, team section, and social media integration.",
    demoUrl: "#",
  },
];

export default async function HomePage() {
  const year = new Date().getFullYear();

  const siteConfig = (await prisma.siteConfig.findFirst()) ?? null;
  const portfolioItems = await prisma.portfolioItem.findMany({ orderBy: { createdAt: "desc" } });

  const portfolioList = portfolioItems.length ? portfolioItems : fallbackPortfolio;
  const email = siteConfig?.email ?? "hello@anamsoft.com";
  const whatsapp = siteConfig?.whatsapp ?? "+37061104553";

  return (
    <main className="min-h-screen bg-blush-50">
      <div className="absolute inset-0 -z-10 gradient-blob" aria-hidden />

      <Navbar />
      <LocalBusinessSchema
        name="Anam Soft"
        url="https://anamsoft.com"
        telephone={siteConfig?.whatsapp ?? "+370 611 04553"}
        email={siteConfig?.email ?? "hello@anamsoft.com"}
        address={{
          streetAddress: "Vilnius",
          addressLocality: "Vilnius",
          addressRegion: "Vilnius County",
          postalCode: "LT-00000",
          addressCountry: "LT",
        }}
      />

      {/* Hero */}
      <section
        id="home"
        className="relative overflow-hidden border-b border-white/60 bg-gradient-to-br from-white via-blush-50 to-blush-100"
      >
        <div className="section-shell max-w-6xl py-20 lg:py-28 grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] items-start fade-up">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Anam Soft for salons & spas</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-slate-900">
              Modern salon websites that book more clients
            </h1>
            <p className="text-lg text-slate-700 leading-relaxed max-w-2xl">
              Mobile-first websites for beauty salons, nail & hair studios, and spas that highlight your services, show availability, and turn visitors into appointments.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="shadow-soft hover:shadow-lg" asChild>
                <a href="#estimate">Get a 2-minute estimate</a>
              </Button>
              <Button variant="outline" size="lg" className="border-slate-200 text-slate-700 hover:border-slate-300 hover:text-blush-700" asChild>
                <a href="#consultation">Book a 20-min consultation</a>
              </Button>
            </div>
            <p className="text-xs text-slate-500">No commitment • Reply within 24h</p>
            <p className="text-sm text-slate-700 flex items-center gap-2">
              <svg
                aria-label="WhatsApp"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                className="h-4 w-4 fill-current text-blush-600"
              >
                <path d="M16 3C9.372 3 4 8.373 4 15.003c0 2.565.77 4.956 2.09 6.95L4 29l7.224-2.04A11.91 11.91 0 0 0 16 27c6.628 0 12-5.373 12-11.997C28 8.373 22.628 3 16 3Zm0 22.195c-1.85 0-3.584-.506-5.07-1.383l-.363-.216-4.287 1.21 1.198-4.183-.236-.383A8.78 8.78 0 0 1 7.805 8.83 8.713 8.713 0 0 1 16 7.195c4.792 0 8.688 3.884 8.688 8.64 0 4.755-3.896 8.66-8.688 8.66Zm4.934-6.482c-.268-.134-1.587-.782-1.834-.87-.247-.089-.427-.134-.606.134-.178.268-.695.87-.852 1.05-.156.178-.313.202-.58.067-.268-.134-1.132-.416-2.157-1.327-.798-.71-1.336-1.587-1.494-1.855-.156-.268-.017-.413.118-.547.122-.121.268-.313.402-.47.134-.156.178-.268.268-.446.089-.178.045-.335-.022-.47-.067-.134-.606-1.465-.83-2.01-.218-.524-.441-.453-.606-.46h-.52c-.178 0-.47.067-.717.335-.247.268-.94.922-.94 2.247 0 1.324.961 2.604 1.095 2.784.134.178 1.891 2.887 4.587 4.044 2.698 1.157 2.698.77 3.184.722.487-.045 1.585-.645 1.81-1.268.223-.623.223-1.157.156-1.268-.067-.112-.245-.178-.513-.313Z" />
              </svg>
              <a
                className="font-semibold text-blush-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blush-200"
                href={`https://wa.me/${(siteConfig?.whatsapp ?? "+370 611 04553").replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Prefer WhatsApp? Message me
              </a>
            </p>
            <div className="flex flex-wrap gap-4 text-[0.75rem] text-slate-500 items-center pt-2">
              <span className="font-semibold text-slate-700">Based in Vilnius</span>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-blush-500" aria-hidden />
                Mobile-first
              </span>
              <span>•</span>
              <span>SEO basics</span>
              <span>•</span>
              <span>Booking integration</span>
            </div>
          </div>

          <div className="relative float-soft">
            <div className="absolute -left-12 -top-10 h-36 w-36 rounded-full bg-blush-300/40 blur-3xl" aria-hidden />
            <Card className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-900">Salon website preview</CardTitle>
                  <Badge variant="outline" className="border-slate-200 text-blush-700">
                    Bookings +32%
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  Vilnius Glow Studio · 30-day launch
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-6">
                <div className="space-y-3 rounded-[24px] border border-slate-100 bg-white p-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.4em] text-slate-400">Preview</span>
                    <span className="text-[0.65rem] text-slate-500">Live demo</span>
                  </div>
                  <div className="h-40 w-full rounded-[20px] border border-slate-200 bg-gradient-to-br from-pink-500/60 to-slate-900/60 shadow-inner">
                    <div className="flex h-full items-center justify-center text-center text-sm text-white/90">
                      <span>Real salon site mockup</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Conversion rate</p>
                    <p className="text-xl font-semibold text-slate-900">+18%</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Speed</p>
                    <p className="text-xl font-semibold text-slate-900">1.3s load</p>
                  </div>
                </div>
                <p className="text-[0.65rem] text-slate-500">Example result • varies by client • see case study</p>
                <a
                  href="#portfolio"
                  className="text-xs font-semibold text-blush-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blush-200"
                >
                  View case study
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-b border-white/60 bg-white/80 fade-up">
        <div className="section-shell max-w-6xl py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blush-50 text-blush-600">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <span>Trusted by beauty & wellness businesses in Vilnius</span>
            </div>
            <div className="flex-1">
              <div className="hidden grid-flow-col gap-x-8 lg:grid lg:auto-cols-min lg:grid-flow-col lg:justify-end">
                {[
                  "Vilnius Lash Studio",
                  "Old Town Spa",
                  "Naujamiestis Hair & Nails",
                  "Amber Wellness",
                  "Glow & Co Salon",
                  "Uptown Hair Lounge",
                ].map((label) => (
                  <div
                    key={label}
                    className="flex h-8 items-center text-sm font-semibold text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-200 focus-visible:ring-offset-2"
                  >
                    <span className="mr-2 h-[24px] w-[1px] bg-slate-200 opacity-50" aria-hidden />
                    <span className="whitespace-nowrap text-[0.85rem] opacity-70">{label}</span>
                  </div>
                ))}
              </div>
              <ScrollArea className="lg:hidden">
                <ScrollAreaViewport className="flex gap-6 pb-2">
                  {[
                    "Vilnius Lash Studio",
                    "Old Town Spa",
                    "Naujamiestis Hair & Nails",
                    "Amber Wellness",
                    "Glow & Co Salon",
                    "Uptown Hair Lounge",
                  ].map((label) => (
                    <div
                      key={`${label}-mobile`}
                      className="flex h-8 items-center border-l border-slate-200 pl-3 text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-slate-500 opacity-70 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-200 focus-visible:ring-offset-2"
                    >
                      {label}
                    </div>
                  ))}
                </ScrollAreaViewport>
                <ScrollBar orientation="horizontal" className="mt-2 h-2 rounded-full bg-slate-200" />
              </ScrollArea>
            </div>
          </div>
          <p className="mt-4 text-[0.75rem] text-slate-500">
            Average launch: 30 days • Mobile-first • Booking integrations ready
          </p>
        </div>
      </section>

      {/* Who I work with & Benefits */}
      <section id="services" className="section-shell max-w-6xl py-16 md:py-20 space-y-10 fade-up">
        <div className="grid gap-10 lg:grid-cols-[1fr,1fr] items-start">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.6em] text-slate-500">Built for salons & spas</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">Websites for beauty & wellness businesses</h2>
            <p className="text-lg text-slate-600 max-w-2xl">
              Mobile-first websites that showcase your services, highlight availability, and keep bookings flowing.
            </p>
            <div className="space-y-3 text-sm text-slate-600">
              {[
                "More online bookings",
                "Mobile-first for Instagram",
                "Fast, clean first impression",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blush-500" aria-hidden />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <Button variant="link" className="text-blush-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-200 focus-visible:ring-offset-2" size="sm" asChild>
              <a href="#pricing">See packages →</a>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {[
              {
                title: "More online bookings",
                desc: "Clear CTAs and booking links that match your services.",
                icon: CalendarClock,
              },
              {
                title: "Professional story",
                desc: "Delicate typography, premium spacing, and refined imagery.",
                icon: Palette,
              },
              {
                title: "Ready for mobile",
                desc: "Fast builds that keep your Instagram referrals clicking ‘Book’.",
                icon: Workflow,
              },
              {
                title: "Easy updates",
                desc: "Access your site to tweak services, prices, or gallery.",
                icon: Sparkles,
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="flex h-full flex-col rounded-[24px] border border-slate-100 bg-white/95 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-within:ring-2 focus-within:ring-blush-200 focus-within:ring-offset-2"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blush-50 text-blush-600">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 leading-snug">{item.title}</h3>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      <ProjectEstimatorWizard />

      <ConsultationBookingSection />

      {/* Process */}
      <section id="process" className="section-shell max-w-5xl py-16 md:py-20 space-y-6 fade-up">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">A simple 4-step process</h2>
          <p className="text-slate-600">Clear steps from first call to launch and ongoing support.</p>
        </div>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <Badge className="bg-blush-100 text-blush-700">Step {index + 1}</Badge>
                {index < steps.length - 1 && <div className="h-full w-px bg-slate-200 flex-1" />}
              </div>
              <Card className="flex-1">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blush-100 text-blush-700 flex items-center justify-center">
                    <step.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">{step.desc}</CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="section-shell max-w-6xl py-16 md:py-20 space-y-6 fade-up">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">Example salon & spa projects</h2>
          <p className="text-slate-600">Selected work for Vilnius-based beauty and wellness teams.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {portfolioList.map((project, idx) => (
            <Card
              key={project.id}
              className="relative overflow-hidden hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blush-50" aria-hidden />
              <div className="relative p-5 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-blush-100 text-blush-700 px-3 py-1 text-xs font-semibold">
                  Case {idx + 1}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-slate-900">{project.title}</h3>
                  <p className="text-sm font-medium text-blush-700">{project.type}</p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>
                <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-blush-50 via-white to-blush-100 border border-blush-100" />
                {project.demoUrl ? (
                  <Button variant="outline" size="sm" className="hover:-translate-y-[1px]" asChild>
                    <a href={project.demoUrl} target="_blank" rel="noreferrer">
                      View project
                    </a>
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-shell max-w-5xl py-16 md:py-20 space-y-6 fade-up">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">What clients say</h2>
          <p className="text-slate-600">A few words from beauty and wellness teams.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.name} className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription>{item.salon}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 leading-relaxed">“{item.quote}”</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-shell max-w-5xl py-16 md:py-20 space-y-6 fade-up">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">Frequently asked questions</h2>
          <p className="text-slate-600">Straight answers about timelines, how we work, and updates.</p>
        </div>
        <Accordion items={faqs} defaultOpenId="timeline" />
      </section>

      <ContactSection email={email} whatsapp={whatsapp} />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80">
        <div className="section-shell max-w-6xl py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
          <span>© {year} AnamSoft</span>
          <div className="flex gap-4">
            <a href="#contact" className="hover:text-blush-700">Contact</a>
            <a href="/privacy" className="hover:text-blush-700">Privacy</a>
            <a href="/about" className="hover:text-blush-700">About</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
