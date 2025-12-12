import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContactForm } from "@/components/contact-form";
import { LocalBusinessSchema } from "@/components/seo/local-business-schema";
import { CalendarClock, Palette, Sparkles, Workflow } from "lucide-react";
import { ContactSection } from "@/components/sections/contact-section";
import { Navbar } from "@/components/navbar";
import { PricingSection } from "@/components/sections/pricing-section";
import { ProjectEstimatorWizard } from "@/components/sections/project-estimator-wizard";
import { ConsultationBookingSection } from "@/components/sections/consultation-booking-section";

export const dynamic = "force-dynamic";

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
        <div className="section-shell max-w-6xl py-20 lg:py-28 grid gap-12 lg:grid-cols-2 items-center fade-up">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-slate-900">
              Websites that make your salon look fully booked
            </h1>
            <p className="text-lg text-slate-700 leading-relaxed max-w-2xl">
              {siteConfig?.heroSubtitle ??
                "Anam Soft builds modern, mobile-friendly websites for beauty salons, nail & hair studios, and spas in Vilnius so they can get more online bookings and loyal clients."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="shadow-soft hover:shadow-lg" asChild>
                <a href="#estimate">Get a project estimate</a>
              </Button>
              <Button variant="outline" size="lg" className="hover:-translate-y-[1px]" asChild>
                <a href="#consultation">Book a free consultation</a>
              </Button>
            </div>
            <p className="text-sm text-slate-600 inline-flex items-center gap-1">
              Or message me on WhatsApp:
              <a
                className="inline-flex items-center gap-1 font-semibold text-blush-700 underline underline-offset-2"
                href={`https://wa.me/${(siteConfig?.whatsapp ?? "+370 611 04553").replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  aria-label="WhatsApp"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                  className="h-4 w-4 fill-current"
                >
                  <path d="M16 3C9.372 3 4 8.373 4 15.003c0 2.565.77 4.956 2.09 6.95L4 29l7.224-2.04A11.91 11.91 0 0 0 16 27c6.628 0 12-5.373 12-11.997C28 8.373 22.628 3 16 3Zm0 22.195c-1.85 0-3.584-.506-5.07-1.383l-.363-.216-4.287 1.21 1.198-4.183-.236-.383A8.78 8.78 0 0 1 7.805 8.83 8.713 8.713 0 0 1 16 7.195c4.792 0 8.688 3.884 8.688 8.64 0 4.755-3.896 8.66-8.688 8.66Zm4.934-6.482c-.268-.134-1.587-.782-1.834-.87-.247-.089-.427-.134-.606.134-.178.268-.695.87-.852 1.05-.156.178-.313.202-.58.067-.268-.134-1.132-.416-2.157-1.327-.798-.71-1.336-1.587-1.494-1.855-.156-.268-.017-.413.118-.547.122-.121.268-.313.402-.47.134-.156.178-.268.268-.446.089-.178.045-.335-.022-.47-.067-.134-.606-1.465-.83-2.01-.218-.524-.441-.453-.606-.46h-.52c-.178 0-.47.067-.717.335-.247.268-.94.922-.94 2.247 0 1.324.961 2.604 1.095 2.784.134.178 1.891 2.887 4.587 4.044 2.698 1.157 2.698.77 3.184.722.487-.045 1.585-.645 1.81-1.268.223-.623.223-1.157.156-1.268-.067-.112-.245-.178-.513-.313Z" />
                </svg>
                {siteConfig?.whatsapp ?? "+370 611 04553"}
              </a>
            </p>
          </div>

          <div className="relative float-soft">
            <div className="absolute -left-12 -top-10 h-40 w-40 rounded-full bg-blush-300/30 blur-3xl" aria-hidden />
            <Card className="relative overflow-hidden bg-white/80 backdrop-blur shadow-soft border border-white/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Salon website preview</CardTitle>
                  <Badge className="bg-blush-100 text-blush-700">Bookings +24%</Badge>
                </div>
                <CardDescription>Lash & Brow Studio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-10 w-32 rounded-full bg-blush-100" />
                <div className="space-y-2">
                  <div className="h-3 w-3/4 rounded-full bg-slate-100" />
                  <div className="h-3 w-2/3 rounded-full bg-slate-100" />
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-blush-50 via-white to-blush-100 p-4 space-y-3">
                  <div className="h-28 rounded-xl bg-white/80" />
                  <div className="flex gap-2">
                    <div className="h-2 w-1/3 rounded-full bg-slate-100" />
                    <div className="h-2 w-1/5 rounded-full bg-slate-100" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-12 flex-1 rounded-xl bg-slate-100" />
                  <div className="h-12 flex-1 rounded-xl bg-slate-100" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-b border-white/60 bg-white/80 fade-up">
        <div className="section-shell max-w-6xl py-6 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
          <span className="text-slate-700">Trusted by beauty & wellness businesses in Vilnius</span>
          <div className="flex flex-wrap gap-3 text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">Vilnius Lash Studio</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Old Town Spa</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Naujamiestis Hair & Nails</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Amber Wellness</span>
          </div>
        </div>
      </section>

      {/* Who I work with & Benefits */}
      <section id="services" className="section-shell max-w-6xl py-16 md:py-20 space-y-10 fade-up">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] items-start">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">Websites for beauty & wellness businesses</h2>
            <p className="text-slate-700 leading-relaxed">
              I focus on beauty & hair salons, nail & lash studios, and day spas or wellness centres. Your clients find you through Google, Instagram, and booking platforms like Fresha or Treatwell—your website should support each of these with clear offers and easy booking paths.
            </p>
            <ul className="text-sm text-slate-700 space-y-2">
              <li>• Beauty & hair salons</li>
              <li>• Nail & lash studios</li>
              <li>• Day spas & wellness centres</li>
              <li>• Google, Instagram, Fresha/Treatwell friendly</li>
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "More online bookings",
                desc: "Clear CTAs, booking links, and forms tailored to your services.",
              },
              {
                title: "Professional first impression",
                desc: "Clean, modern layouts that match your brand visuals.",
              },
              {
                title: "Mobile-first for Instagram",
                desc: "Optimised for phones so IG visitors can book instantly.",
              },
            ].map((item) => (
              <Card key={item.title} className="h-full bg-white/80">
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">{item.desc}</CardContent>
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
