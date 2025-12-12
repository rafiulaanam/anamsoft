import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const DEFAULTS = {
  heroTitle: "Websites for beauty salons & spas in Vilnius",
  heroSubtitle:
    "At AnamSoft, I build modern, mobile-friendly websites for beauty salons, nail & hair studios, and spas in Vilnius so they can get more online bookings and loyal clients.",
  email: "hello@anamsoft.com",
};

const numberGuard = (val: unknown) => typeof val === "number" && Number.isFinite(val);

export async function GET() {
  try {
    let config = await prisma.siteConfig.findFirst();
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          heroTitle: DEFAULTS.heroTitle,
          heroSubtitle: DEFAULTS.heroSubtitle,
          email: DEFAULTS.email,
        },
      });
    }
    return NextResponse.json({ data: config });
  } catch (error) {
    console.error("Advanced settings GET error", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data: Record<string, any> = {};

    const booleanFields = [
      "sendAdminLeadEmails",
      "sendClientLeadEmails",
      "dailyLeadSummaryEmail",
      "autoFollowupEnabled",
      "showLanguageSwitcher",
      "aiFeaturesEnabled",
      "aiDraftReplyEnabled",
    ];

    booleanFields.forEach((field) => {
      if (field in body && typeof body[field] === "boolean") {
        data[field] = body[field];
      }
    });

    if ("autoFollowupDays" in body) {
      const v = Number(body.autoFollowupDays);
      if (!numberGuard(v) || v < 1 || v > 90) {
        return NextResponse.json({ error: "autoFollowupDays must be between 1 and 90" }, { status: 400 });
      }
      data.autoFollowupDays = v;
    }

    if ("markStaleAfterDays" in body) {
      const v = Number(body.markStaleAfterDays);
      if (!numberGuard(v) || v < 1 || v > 365) {
        return NextResponse.json({ error: "markStaleAfterDays must be between 1 and 365" }, { status: 400 });
      }
      data.markStaleAfterDays = v;
    }

    if ("defaultLocale" in body && typeof body.defaultLocale === "string") {
      data.defaultLocale = body.defaultLocale;
    }
    if ("secondaryLocale" in body) {
      data.secondaryLocale = body.secondaryLocale || null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
    }

    let existing = await prisma.siteConfig.findFirst();
    if (!existing) {
      existing = await prisma.siteConfig.create({
        data: {
          heroTitle: DEFAULTS.heroTitle,
          heroSubtitle: DEFAULTS.heroSubtitle,
          email: DEFAULTS.email,
        },
      });
    }

    const updated = await prisma.siteConfig.update({
      where: { id: existing.id },
      data,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Advanced settings PATCH error", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
