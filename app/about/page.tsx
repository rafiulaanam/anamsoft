import { Navbar } from "@/components/navbar";

export const metadata = {
  title: "About AnamSoft",
  description:
    "Learn about AnamSoft — a Vilnius-based studio building modern, mobile-friendly websites and software for salons and small businesses.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-blush-50">
        <div className="section-shell max-w-5xl py-16 md:py-20 space-y-12">
          <header className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-blush-700">About</p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">About AnamSoft</h1>
            <p className="text-slate-600 max-w-3xl">
              AnamSoft is a Vilnius-based web and software studio building modern, mobile-friendly websites and landing pages
              for beauty salons, nail & hair studios, spas, and other small businesses.
            </p>
          </header>

          <section className="grid gap-8 md:grid-cols-2 items-start">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">What we do</h2>
              <p className="text-slate-700 leading-relaxed">
                We design and develop sites that feel polished on mobile and desktop, with clear calls-to-action that help your
                clients book. From discovery calls to launch, we keep communication simple and timelines transparent.
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Website strategy, UX, and conversion-focused copy</li>
                <li>Custom, mobile-first builds using Next.js and modern tooling</li>
                <li>Booking integrations, contact forms, and fast performance</li>
                <li>Ongoing updates and support after launch</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Who we serve</h2>
              <p className="text-slate-700 leading-relaxed">
                We work with beauty & wellness studios, local service providers, and small businesses that value a professional
                online presence. Whether you are opening your first salon or refreshing an established brand, we tailor the
                site to your goals.
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Beauty & wellness: salons, spas, barbers, nail & hair studios</li>
                <li>Local services: trades, home services, community businesses</li>
                <li>Professional services: consultants, trainers, small e-commerce</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">How we work</h2>
            <p className="text-slate-700 leading-relaxed">
              Our process is collaborative and transparent: a quick discovery call, a clear plan for content and structure,
              design & build with regular check-ins, and support after launch. We keep things simple so you can focus on your
              business while we handle the tech.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Discovery", desc: "30-minute chat to learn your services, audience, and goals." },
                { title: "Design & build", desc: "Mobile-first layouts, clean visuals, and clear booking prompts." },
                { title: "Launch & support", desc: "Smooth handoff, light updates, and help with analytics and SEO basics." },
              ].map((item) => (
                <div key={item.title} className="card-surface p-5 shadow-soft">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">Get in touch</h2>
            <p className="text-slate-700 leading-relaxed">
              If you want a site that reflects your salon or business and helps clients book with ease, reach out. We are
              happy to review your current site and share a simple plan to improve it.
            </p>
            <div className="text-slate-700 space-y-1 text-sm">
              <p>
                Email: <a className="text-blush-700 hover:text-blush-800" href="mailto:hello@anamsoft.com">hello@anamsoft.com</a>
              </p>
              <p>
                Phone / WhatsApp: <a className="text-blush-700 hover:text-blush-800" href="https://wa.me/37061104553">+37061104553</a>
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
