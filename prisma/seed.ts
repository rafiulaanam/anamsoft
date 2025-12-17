import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERVICE_SLUG = "salon-website-packages";

const SERVICE_INPUT = {
  title: "Salon Website Packages",
  slug: SERVICE_SLUG,
  shortDescription: "Transparent pricing for salon websites with built-in booking, SEO, and polish.",
  description:
    "A dedicated catalog of salon website packages that keeps pricing clear for visitors and mirrors the admin-controlled landing section.",
  isActive: true,
};

const PACKAGE_IDS = {
  starterPresence: "64f600000000000000000001",
  bookingReady: "64f600000000000000000002",
  premiumSalon: "64f600000000000000000003",
} as const;

type SeedPackage = {
  id: string;
  title: string;
  priceFrom: number;
  currency: string;
  badge: string | null;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  sortOrder: number;
  isFeaturedOnLanding: boolean;
  isRecommended: boolean;
  isActive: boolean;
};

const packages: SeedPackage[] = [
  {
    id: PACKAGE_IDS.starterPresence,
    title: "Starter Presence",
    priceFrom: 399,
    currency: "EUR",
    badge: null,
    description: "Perfect for small studios that need a clean, simple website to look professional online.",
    features: [
      "1–3 pages (Home, Services, Contact)",
      "Mobile-friendly design",
      "Basic SEO setup",
      "Contact form or WhatsApp link",
      "Launch support",
    ],
    ctaLabel: "Book a free call",
    ctaHref: "#contact",
    sortOrder: 1,
    isFeaturedOnLanding: true,
    isRecommended: false,
    isActive: true,
  },
  {
    id: PACKAGE_IDS.bookingReady,
    title: "Booking-Ready Website",
    priceFrom: 699,
    currency: "EUR",
    badge: "Most popular",
    description: "Best for salons that want more online bookings from Google, Instagram and returning clients.",
    features: [
      "4–6 pages (Home, Services, Prices, Gallery, About, Contact)",
      "Booking-focused layout (buttons + clear flows)",
      "Integration with booking tool (Fresha/Treatwell/WhatsApp)",
      "Conversion-focused copy and structure",
      "Basic on-page SEO (title, meta, headings)",
      "Training call on how to use the site",
    ],
    ctaLabel: "Most popular — book a free call",
    ctaHref: "#contact",
    sortOrder: 2,
    isFeaturedOnLanding: true,
    isRecommended: false,
    isActive: true,
  },
  {
    id: PACKAGE_IDS.premiumSalon,
    title: "Premium Salon Experience",
    priceFrom: 1199,
    currency: "EUR",
    badge: null,
    description: "For bigger salons or chains that need a custom design, multiple locations, and extra integrations.",
    features: [
      "Custom-designed pages (up to X pages)",
      "Multi-location or multi-language support (e.g. LT + EN)",
      "Advanced gallery / portfolio",
      "Blog or news section (optional)",
      "Priority support for the first 3 months",
      "Option to add ongoing maintenance (monthly)",
    ],
    ctaLabel: "Talk about a custom project",
    ctaHref: "#contact",
    sortOrder: 3,
    isFeaturedOnLanding: true,
    isRecommended: false,
    isActive: true,
  },
] as const;

async function main() {
  const service = await prisma.service.upsert({
    where: { slug: SERVICE_SLUG },
    update: SERVICE_INPUT,
    create: SERVICE_INPUT,
  });

  for (const pkg of packages) {
    await prisma.servicePackage.upsert({
      where: { id: pkg.id },
      update: {
        serviceId: service.id,
        title: pkg.title,
        priceFrom: pkg.priceFrom,
        currency: pkg.currency,
        description: pkg.description,
        features: pkg.features,
        badge: pkg.badge,
        ctaLabel: pkg.ctaLabel,
        ctaHref: pkg.ctaHref,
        sortOrder: pkg.sortOrder,
        isFeaturedOnLanding: pkg.isFeaturedOnLanding,
        isRecommended: pkg.isRecommended,
        isActive: pkg.isActive,
      },
      create: {
        id: pkg.id,
        serviceId: service.id,
        title: pkg.title,
        priceFrom: pkg.priceFrom,
        currency: pkg.currency,
        description: pkg.description,
        features: pkg.features,
        badge: pkg.badge,
        ctaLabel: pkg.ctaLabel,
        ctaHref: pkg.ctaHref,
        sortOrder: pkg.sortOrder,
        isFeaturedOnLanding: pkg.isFeaturedOnLanding,
        isRecommended: pkg.isRecommended,
        isActive: pkg.isActive,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
