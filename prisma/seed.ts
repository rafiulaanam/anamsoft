import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const existingConfig = await prisma.siteConfig.findFirst();
  if (existingConfig) {
    await prisma.siteConfig.update({
      where: { id: existingConfig.id },
      data: {
        heroTitle: "Websites for beauty salons & spas in Vilnius",
        heroSubtitle:
          "At Anam Soft, I build modern, mobile-friendly websites for beauty salons, nail & hair studios, and spas in Vilnius so they can get more online bookings and loyal clients.",
        email: "hello@anamsoft.com",
        whatsapp: "+370 611 04553",
      },
    });
  } else {
    await prisma.siteConfig.create({
      data: {
        heroTitle: "Websites for beauty salons & spas in Vilnius",
        heroSubtitle:
          "At Anam Soft, I build modern, mobile-friendly websites for beauty salons, nail & hair studios, and spas in Vilnius so they can get more online bookings and loyal clients.",
        email: "hello@anamsoft.com",
        whatsapp: "+370 611 04553",
      },
    });
  }

  const services = [
    {
      name: "Starter Salon Website",
      slug: "starter-salon-website",
      description:
        "1–3 pages (Home, Services/Prices, Contact), mobile-friendly design, booking link integration, and basic SEO setup for quick launch.",
      priceFrom: 450,
    },
    {
      name: "Booking-Optimised Website",
      slug: "booking-optimised-website",
      description:
        "4–6 pages with clear book-now CTAs, service pages for key treatments, booking platform integration, maps/reviews, and a month of light updates.",
      priceFrom: 800,
    },
    {
      name: "Premium Beauty & Spa Website",
      slug: "premium-beauty-spa-website",
      description:
        "Up to 8–10 pages, LT + EN, dedicated galleries, team page, performance tuning, stronger SEO foundation, and priority support after launch.",
      priceFrom: 1200,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  const portfolioItems = [
    {
      title: "Vilnius Lash & Brow Studio",
      slug: "vilnius-lash-brow-studio",
      type: "Lash & Brow Studio",
      description:
        "Clean, mobile-first site with service list, gallery, and clear book-now buttons tied to the studio’s booking system.",
      isDemo: true,
    },
    {
      title: "Old Town Spa & Wellness",
      slug: "old-town-spa-wellness",
      type: "Day Spa",
      description:
        "Calming site for a Vilnius Old Town spa with spa packages, treatments overview, gift vouchers, and directions.",
      isDemo: true,
    },
    {
      title: "Naujamiestis Hair & Nail Studio",
      slug: "naujamiestis-hair-nail-studio",
      type: "Hair & Nail Salon",
      description:
        "Modern site combining hair and nail services, price list, team section, and social media integration with fast mobile performance.",
      isDemo: true,
    },
  ];

  for (const item of portfolioItems) {
    await prisma.portfolioItem.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }

  const adminPassword = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@anamsoft.com" },
    update: {
      name: "Admin",
      role: "ADMIN",
      hashedPassword: adminPassword,
      emailVerified: new Date(),
    },
    create: {
      email: "admin@anamsoft.com",
      name: "Admin",
      role: "ADMIN",
      hashedPassword: adminPassword,
      emailVerified: new Date(),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
