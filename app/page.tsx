import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContactForm } from "@/components/contact-form";
import { CalendarClock, Palette, Sparkles, Workflow } from "lucide-react";

const services = [
  {
    title: "Starter Salon Website",
    desc: "For solo stylists and boutique salons in Vilnius who need a fast, polished web presence.",
    items: [
      "1–3 pages (Home, Services/Prices, Contact)",
      "Mobile-friendly design",
      "Booking link integration (Fresha, Treatwell, WhatsApp or phone)",
      "Basic SEO setup (Google-friendly titles & descriptions)",
      "Delivery in about 7 days after receiving content",
    ],
    price: "from 450 €",
  },
  {
    title: "Booking-Optimised Website",
    desc: "Designed to convert visitors into bookings for nail, hair, lash, and facial services.",
    items: [
      "4–6 pages (Home, Services, Prices, Gallery, About, Contact)",
      "Clear “Book now” buttons and calls-to-action",
      "Integration with Fresha/Treatwell or custom contact form",
      "Service pages for key treatments (hair, nails, lashes, facials, etc.)",
      "Google Maps & basic review highlights",
      "1 month of small text/image tweaks after launch",
    ],
    price: "from 800 €",
  },
  {
    title: "Premium Beauty & Spa Website",
    desc: "A flagship site for established spas and multi-service studios looking for depth and polish.",
    items: [
      "Up to 8–10 pages",
      "Multi-language (LT + EN)",
      "Dedicated gallery & before/after sections with modest, professional photos",
      "Separate team page (stylists, therapists)",
      "Extra performance optimisation & stronger SEO foundation",
      "Priority support for 1 month after launch",
    ],
    price: "from 1,200 €",
  },
];

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

const portfolio = [
  {
    name: "Vilnius Lash & Brow Studio",
    type: "Lash & brow studio",
    desc: "A clean, mobile-first website with service list, gallery and clear “Book now” buttons linking to the studio’s booking system.",
    highlight: "Strong focus on before/after gallery and easy booking from mobile.",
    url: "https://example.com/lash-brow",
  },
  {
    name: "Old Town Spa & Wellness",
    type: "Day spa",
    desc: "A calming website for a spa in Vilnius Old Town, with spa packages, treatments overview, gift voucher information and directions.",
    highlight: "Relaxing visual style and clear information for tourists and locals.",
    url: "https://example.com/old-town-spa",
  },
  {
    name: "Naujamiestis Hair & Nail Studio",
    type: "Hair & nail salon",
    desc: "Modern website combining hair and nail services, price list, team section and social media integration.",
    highlight: "Simple structure and fast mobile performance.",
    url: "https://example.com/naujamiestis-hair-nail",
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
    role: "Owner, Lash & Brow Studio",
    quote:
      "The site looks elegant and makes it easy for clients to book from their phones. We had bookings coming in the first week after launch.",
  },
  {
    name: "Eglė",
    role: "Owner, Vilnius Salon",
    quote:
      "Clear process, great communication, and a website that finally reflects our services. I don’t have to worry about the tech side at all.",
  },
];

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-blush-50">
      <div className="absolute inset-0 -z-10 gradient-blob" aria-hidden />

      <Navbar />

      {/* Hero */}
      <section id="home" className="section-shell flex flex-col gap-12 py-16 md:py-20 lg:py-24 scroll-mt-20">
        <div className="grid gap-12 lg:grid-cols-[1.05fr,0.95fr] items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-blush-700 shadow-sm ring-1 ring-white/80">
              Beauty, hair, nails, spa — Vilnius
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-slate-900 drop-shadow-sm">
              Websites for beauty salons & spas in Vilnius
            </h1>
            <p className="text-lg text-slate-700 leading-relaxed max-w-2xl">
              At AnamSoftStudio, I build modern, mobile-friendly websites for beauty salons, nail & hair
              studios, and spas in Vilnius so they can get more online bookings and loyal clients.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button size="lg" className="shadow-soft hover:shadow-lg hover:-translate-y-[1px]" asChild>
                <a href="#contact">Get a free website audit</a>
              </Button>
              <Button variant="outline" size="lg" className="hover:-translate-y-[1px]" asChild>
                <a href="#services">See packages</a>
              </Button>
            </div>
            <span className="text-sm text-slate-600">
                Or message me on WhatsApp: <span className="font-semibold text-blush-700">+370 XXX XXXX</span>
              </span>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-blush-500" /> Mobile-first builds
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-blush-500" /> Booking-focused copy
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-blush-500" /> Local SEO-ready
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-blush-400/25 blur-3xl" aria-hidden />
            <div className="card-surface p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-white via-blush-50 to-white">
              <div className="absolute right-6 top-6 h-16 w-16 rounded-full bg-blush-100/80 blur-md" aria-hidden />
              <div className="absolute -bottom-6 -left-10 h-32 w-32 rounded-full bg-blush-200/50 blur-2xl" aria-hidden />
              <div className="space-y-5 relative">
                <p className="text-sm uppercase tracking-[0.2em] text-blush-700 font-semibold">
                  What you get
                </p>
                <ul className="space-y-4 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blush-500" />
                    Polished visuals tailored to your brand and services.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blush-500" />
                    Fast-loading pages that feel great on mobile.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blush-500" />
                    Clear calls-to-action so clients book right away.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blush-500" />
                    Launch support plus analytics to track bookings.
                  </li>
                </ul>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="rounded-xl bg-white/60 p-4 border border-white/80 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Focus</p>
                    <p className="mt-1 font-semibold text-slate-900">Bookings first</p>
                  </div>
                  <div className="rounded-xl bg-white/60 p-4 border border-white/80 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Style</p>
                    <p className="mt-1 font-semibold text-slate-900">Soft & elegant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who I work with */}
      <section id="who" className="section-shell py-14 md:py-20 scroll-mt-20">
        <div className="card-surface p-8 sm:p-10 hover:shadow-xl">
          <div className="space-y-4 max-w-4xl">
            <span className="text-sm font-semibold text-blush-700">Who I work with</span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">
              Websites for beauty & wellness businesses
            </h2>
            <p className="text-slate-700 leading-relaxed">
              AnamSoftStudio specialises in websites for beauty & hair salons, nail & lash studios, and day spas or wellness centres in Vilnius. Your clients often find you through Google, Instagram, and booking platforms—your website should support each of these channels with clear offers and easy booking paths.
            </p>
            <div className="grid gap-3 sm:grid-cols-3 text-sm text-slate-700">
              <div className="rounded-xl border border-blush-100 bg-white/70 p-4 shadow-sm">
                Beauty & hair salons
              </div>
              <div className="rounded-xl border border-blush-100 bg-white/70 p-4 shadow-sm">
                Nail & lash studios
              </div>
              <div className="rounded-xl border border-blush-100 bg-white/70 p-4 shadow-sm">
                Day spas & wellness centres
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section-shell py-16 md:py-20 scroll-mt-20">
        <div className="flex flex-col gap-3 mb-10">
          <span className="text-sm font-semibold text-blush-700">Services</span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">Choose the right website package</h2>
          <p className="text-slate-600 max-w-2xl">
            Whether you are opening your first studio or refreshing an established spa, I match the build to your goals and timeline.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.title}
              className="flex flex-col hover:-translate-y-1 hover:shadow-xl"
            >
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.desc}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <ul className="space-y-3 text-sm text-slate-700">
                  {service.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blush-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <p className="text-base font-semibold text-blush-700">{service.price}</p>
                  <Button variant="outline" size="sm" className="hover:-translate-y-[1px]" asChild>
                    <a href="#contact">Discuss</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Process */}
      <section id="process" className="section-shell py-16 md:py-20 scroll-mt-20">
        <div className="flex flex-col gap-3 mb-10">
          <span className="text-sm font-semibold text-blush-700">Process</span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">A clear path from idea to launch</h2>
          <p className="text-slate-600 max-w-2xl">
            I keep projects simple: short feedback loops, transparent timelines, and sites that are ready to convert on day one.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="card-surface relative overflow-hidden bg-gradient-to-b from-white to-blush-50/60 p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-blush-100/70" aria-hidden />
              <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-blush-100/50" aria-hidden />
              <div className="flex items-start justify-between relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-blush-100 px-3 py-1 text-xs font-semibold text-blush-700 shadow-sm">
                  <span>Step</span>
                  <span className="text-sm">{index + 1}</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-white/80 border border-blush-100 flex items-center justify-center text-blush-600 shadow-sm">
                  <step.icon className="h-4 w-4" aria-hidden />
                </div>
              </div>
              <div className="space-y-2 relative">
                <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="section-shell py-16 md:py-20 scroll-mt-20">
        <div className="flex flex-col gap-3 mb-10">
          <span className="text-sm font-semibold text-blush-700">Portfolio</span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">Recent beauty & wellness builds</h2>
          <p className="text-slate-600 max-w-2xl">
            Example site experiences crafted for Vilnius-based salons and spas.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {portfolio.map((project, idx) => (
            <Card
              key={project.name}
              className="relative overflow-hidden hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blush-50" aria-hidden />
              <div className="relative p-6 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-blush-100 text-blush-700 px-3 py-1 text-xs font-semibold">
                  Case {idx + 1}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-slate-900">{project.name}</h3>
                  <p className="text-sm font-medium text-blush-700">{project.type}</p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{project.desc}</p>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{project.highlight}</p>
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="hover:-translate-y-[1px]" asChild>
                    <a href={project.url} target="_blank" rel="noreferrer">
                      View project
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section-shell py-16 md:py-20 scroll-mt-20">
        <div className="flex flex-col gap-3 mb-10">
          <span className="text-sm font-semibold text-blush-700">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">What clients say</h2>
          <p className="text-slate-600 max-w-2xl">
            Short notes from salon owners who partnered with AnamSoftStudio.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((item) => (
            <Card key={item.name} className="h-full hover:-translate-y-1 hover:shadow-xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription className="text-sm">{item.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed">“{item.quote}”</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="section-shell py-16 md:py-20 scroll-mt-20">
        <div className="card-surface overflow-hidden hover:shadow-xl hover:-translate-y-1">
          <div className="grid gap-6 md:grid-cols-[1fr,1.2fr] items-center">
            <div className="bg-gradient-to-br from-blush-100 via-white to-blush-50 h-full w-full p-10 flex flex-col justify-center">
              <h3 className="text-2xl font-semibold text-slate-900">About AnamSoftStudio</h3>
              <p className="mt-4 text-slate-700 leading-relaxed">
                I am Rafi, founder and web developer based in Vilnius, specialising in beauty & wellness businesses. I combine thoughtful UX, booking-focused copy, and fast tech to help salons turn visitors into loyal clients.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-700">
                <span className="rounded-full bg-white px-4 py-2 shadow-sm">Local SEO</span>
                <span className="rounded-full bg-white px-4 py-2 shadow-sm">Fast mobile builds</span>
                <span className="rounded-full bg-white px-4 py-2 shadow-sm">Brand-consistent visuals</span>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <h4 className="text-lg font-semibold text-slate-900">Why studios work with me</h4>
              <ul className="space-y-4 text-slate-700 text-sm leading-relaxed">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blush-500" />
                  Websites tailored to how your clients actually book appointments.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blush-500" />
                  Collaborative process with quick prototypes and clear handoff.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blush-500" />
                  Ongoing support for updates, seasonal offers, and campaigns.
                </li>
              </ul>
              <Button variant="outline" className="mt-4" asChild>
                <a href="#contact">Plan your site</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-shell py-16 md:py-20 scroll-mt-20">
        <div className="flex flex-col gap-3 mb-10">
          <span className="text-sm font-semibold text-blush-700">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">Common questions</h2>
          <p className="text-slate-600 max-w-2xl">Straight answers about timelines, how we work, and updates.</p>
        </div>
        <Accordion items={faqs} defaultOpenId="timeline" />
      </section>

      {/* Contact */}
      <section id="contact" className="section-shell py-16 md:py-20 scroll-mt-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr] items-start">
          <div className="space-y-5">
            <span className="text-sm font-semibold text-blush-700">Contact</span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">Let’s talk about your salon website</h2>
            <p className="text-slate-600">
              Tell me about your salon, services, and what you want to improve. I’ll send a quick plan to increase bookings.
            </p>
            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <span className="font-semibold">Email:</span>{" "}
                <a className="hover:text-blush-700" href="mailto:hello@anamsoft.com">
                  hello@anamsoft.com
                </a>
              </div>
              <div>
                <span className="font-semibold">WhatsApp / phone:</span>{" "}
                <a className="hover:text-blush-700" href="https://wa.me/37061104553">
                  +370 611 04553
                </a>
              </div>
              <div>
                <span className="font-semibold">Location:</span> Vilnius, Lithuania (working with clients online)
              </div>
            </div>
          </div>

          <div className="card-surface p-6 sm:p-8 hover:shadow-xl">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80">
        <div className="section-shell py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
          <span>© {year} AnamSoftStudio</span>
          <div className="flex gap-4">
            <a href="#services" className="hover:text-blush-700">Services</a>
            <a href="#portfolio" className="hover:text-blush-700">Portfolio</a>
            <a href="#contact" className="hover:text-blush-700">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
