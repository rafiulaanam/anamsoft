import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

type PricingPlan = {
  id: string;
  title: string;
  serviceTitle?: string;
  badge?: string | null;
  priceFrom: number | null;
  currency?: string;
  description?: string | null;
  features: string[];
  ctaLabel?: string | null;
  ctaHref?: string | null;
  isFeaturedOnLanding?: boolean;
};

const formatCurrency = (value: number | null | undefined, currency = "EUR") => {
  if (value == null) {
    return "Custom quote";
  }
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

export const dynamic = "force-dynamic";

export async function PricingSection() {
  const pkgRecords = await prisma.servicePackage.findMany({
    where: { isActive: true, isFeaturedOnLanding: true },
    orderBy: { sortOrder: "asc" },
    take: 3,
    include: {
      service: {
        select: {
          title: true,
        },
      },
    },
  });
  const plans = pkgRecords.map((pkg) => ({
    id: pkg.id,
    title: pkg.title ?? "Package",
    serviceTitle: pkg.service?.title ?? undefined,
    badge: pkg.badge ?? (pkg.isRecommended ? "Recommended" : undefined),
    priceFrom: pkg.priceFrom ?? null,
    currency: pkg.currency ?? "EUR",
    description: pkg.description ?? "",
    features: pkg.features ?? [],
    ctaLabel: pkg.ctaLabel ?? "Book a free call",
    ctaHref: pkg.ctaHref ?? "#contact",
    isFeaturedOnLanding: pkg.isFeaturedOnLanding ?? false,
  }));

  if (plans.length === 0) {
    return null;
  }

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
              key={plan.id}
              className={`relative flex h-full flex-col rounded-3xl border bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                plan.isFeaturedOnLanding ? "border-pink-300/70 bg-gradient-to-b from-white via-white to-pink-50" : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute inset-x-0 -top-3 flex justify-center">
                  <Badge className="bg-blush-100 text-pink-700 border-pink-200">{plan.badge}</Badge>
                </div>
              )}
              <CardHeader className="space-y-2 pt-6">
                <CardTitle className="text-xl text-slate-900">{plan.title}</CardTitle>
                {plan.serviceTitle && (
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {plan.serviceTitle}
                  </p>
                )}
                <p className="text-3xl font-semibold text-slate-900">{formatCurrency(plan.priceFrom, plan.currency)}</p>
                {plan.description && (
                  <CardDescription className="text-slate-600">{plan.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <ul className="space-y-2 text-sm text-slate-700">
                  {plan.features.length === 0 ? (
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blush-500" />
                      <span>No features added yet</span>
                    </li>
                  ) : (
                    plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blush-500" />
                        <span>{feature}</span>
                      </li>
                    ))
                  )}
                </ul>
                <div className="mt-auto pt-4">
                  <Button
                    asChild
                    className={`w-full ${plan.isFeaturedOnLanding ? "" : "bg-white text-blush-700 border border-blush-200 hover:bg-blush-50"}`}
                    variant={plan.isFeaturedOnLanding ? "default" : "outline"}
                  >
                    <a href={plan.ctaHref ?? "#contact"}>{plan.ctaLabel ?? "Book a free call"}</a>
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
