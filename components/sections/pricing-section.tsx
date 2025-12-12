import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Starter Presence",
    price: "from 399 €",
    description: "Perfect for small studios that need a clean, simple website to look professional online.",
    features: [
      "1–3 pages (Home, Services, Contact)",
      "Mobile-friendly design",
      "Basic SEO setup",
      "Contact form or WhatsApp link",
      "Launch support",
    ],
    cta: "Book a free call",
    highlight: false,
  },
  {
    name: "Booking-Ready Website",
    price: "from 699 €",
    description: "Best for salons that want more online bookings from Google, Instagram and returning clients.",
    features: [
      "4–6 pages (Home, Services, Prices, Gallery, About, Contact)",
      "Booking-focused layout (buttons + clear flows)",
      "Integration with your booking tool (Fresha/Treatwell/WhatsApp)",
      "Conversion-focused copy and structure",
      "Basic on-page SEO (title, meta, headings)",
      "Training call on how to use the site",
    ],
    cta: "Most popular – book a free call",
    highlight: true,
  },
  {
    name: "Premium Salon Experience",
    price: "from 1199 €",
    description: "For bigger salons or chains that need a custom design, multiple locations and extra integrations.",
    features: [
      "Custom-designed pages (up to X pages)",
      "Multi-location or multi-language support (e.g. LT + EN)",
      "Advanced gallery / portfolio",
      "Blog or news section (optional)",
      "Priority support for the first 3 months",
      "Option to add ongoing maintenance (monthly)",
    ],
    cta: "Talk about a custom project",
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-muted/40">
      <div className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-blush-700 shadow-sm">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">Simple packages for salons & spas</h2>
          <p className="text-slate-600">
            Every project starts with a free consultation and a clear fixed price. No surprises.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex h-full flex-col rounded-3xl border bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                plan.highlight ? "border-pink-300/70 bg-gradient-to-b from-white via-white to-pink-50" : ""
              }`}
            >
              {plan.highlight && (
                <div className="absolute inset-x-0 -top-3 flex justify-center">
                  <Badge className="bg-pink-100 text-pink-700 border-pink-200">Most popular</Badge>
                </div>
              )}
              <CardHeader className="space-y-2 pt-6">
                <CardTitle className="text-xl text-slate-900">{plan.name}</CardTitle>
                <p className="text-3xl font-semibold text-slate-900">{plan.price}</p>
                <CardDescription className="text-slate-600">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <ul className="space-y-2 text-sm text-slate-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blush-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-4">
                  <Button
                    asChild
                    className={`w-full ${plan.highlight ? "" : "bg-white text-blush-700 border border-blush-200 hover:bg-blush-50"}`}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    <a href="#contact">{plan.cta}</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-2 text-sm text-slate-700">
          <p>Prices are starting points. After a short call, I’ll send a tailored quote based on your salon size and needs.</p>
          <a
            href="#contact"
            className="font-semibold text-blush-700 hover:text-blush-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 focus-visible:ring-offset-2"
          >
            Not sure which plan fits? Contact me
          </a>
          <p className="text-xs text-slate-500">Payment can be split into 2 parts (50% upfront, 50% on launch).</p>
        </div>
      </div>
    </section>
  );
}
