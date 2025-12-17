import { cache } from "react";
import { prisma } from "@/lib/db";

const DEFAULT_SITE_CONFIG = {
  heroTitle: "Websites for beauty salons & spas in Vilnius",
  heroSubtitle:
    "At Anam Soft, I build modern, mobile-friendly websites for beauty salons, nail & hair studios, and spas in Vilnius so they can get more online bookings and loyal clients.",
  email: "hello@anamsoft.com",
  whatsapp: "+370 611 04553",
  heroPrimaryCtaLabel: "Get a 2-minute estimate",
  heroPrimaryCtaLink: "#estimate",
  heroSecondaryCtaLabel: "Book a 20-min consultation",
  heroSecondaryCtaLink: "#consultation",
};

export const getSiteConfig = cache(async () => {
  let config = await prisma.siteConfig.findFirst();
  if (!config) {
    config = await prisma.siteConfig.create({ data: DEFAULT_SITE_CONFIG });
  }
  return config;
});

export const getPublishedServices = cache(async () => {
  return prisma.service.findMany({
    where: { isActive: true },
    orderBy: [
      { sortOrder: "asc" },
      { updatedAt: "desc" },
    ],
  });
});

export const getPublishedPortfolioItems = cache(async () => {
  return prisma.portfolioItem.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });
});

export const getPublishedTestimonials = cache(async () => {
  return prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    take: 6,
  });
});

export const getPublishedFaqs = cache(async () => {
  return prisma.faq.findMany({
    where: { isPublished: true },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });
});
