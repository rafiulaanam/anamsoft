import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
      title: "Salon Essentials Website",
      slug: "salon-essentials-website",
      shortDescription: "Clean, modern site for salons that need bookings to be obvious.",
      description:
        "A focused salon website with clear services, pricing, testimonials, and a frictionless booking/contact flow. Built mobile-first with fast performance and basic SEO baked in.",
      icon: "scissors",
      imageUrl: null,
      startingPrice: 650,
      deliveryDaysMin: 7,
      deliveryDaysMax: 12,
      packages: [
        {
          name: "Basic",
          price: 650,
          isRecommended: false,
          deliveryDays: 7,
          items: [
            "Up to 3 pages (Home, Services, Contact)",
            "Mobile-first layout",
            "WhatsApp/phone CTA buttons",
            "Basic on-page SEO",
          ],
        },
        {
          name: "Standard",
          price: 950,
          isRecommended: true,
          deliveryDays: 10,
          items: [
            "Up to 6 pages (adds About, Gallery, FAQs)",
            "Optimised booking CTA and contact form",
            "Google Analytics + meta tags",
            "Light copy guidance",
          ],
        },
        {
          name: "Pro",
          price: 1400,
          isRecommended: false,
          deliveryDays: 14,
          items: [
            "Up to 8 pages + blog/news",
            "Booking tool integration (Fresha/Treatwell) or custom form",
            "Performance pass + accessibility basics",
            "1 month of small tweaks after launch",
          ],
        },
      ],
    },
    {
      title: "Local Services Website",
      slug: "local-services-website",
      shortDescription: "For local service pros who need leads from Google and WhatsApp.",
      description:
        "A trustworthy local services website with clear services, pricing hints, testimonials, and fast ways to contact you. Built to convert visitors from Google Maps, search, and social.",
      icon: "wrench",
      imageUrl: null,
      startingPrice: 750,
      deliveryDaysMin: 8,
      deliveryDaysMax: 14,
      packages: [
        {
          name: "Basic",
          price: 750,
          isRecommended: false,
          deliveryDays: 8,
          items: [
            "Up to 4 pages (Home, Services, About, Contact)",
            "Mobile-first and fast",
            "Clear CTAs (call/WhatsApp/email)",
            "Basic SEO setup",
          ],
        },
        {
          name: "Standard",
          price: 1150,
          isRecommended: true,
          deliveryDays: 12,
          items: [
            "Up to 7 pages + testimonials",
            "Service detail sections with FAQs",
            "Lead forms + email notifications",
            "Google Analytics + Search Console basics",
          ],
        },
        {
          name: "Pro",
          price: 1700,
          isRecommended: false,
          deliveryDays: 16,
          items: [
            "Up to 10 pages + blog/news",
            "Optional multi-language structure",
            "Structured data basics for services",
            "1 month of support after launch",
          ],
        },
      ],
    },
  ];

  // Seed services with packages/items (one recommended per service)
  for (const svc of services) {
    const { packages, ...serviceData } = svc;
    const service = await prisma.service.upsert({
      where: { slug: serviceData.slug },
      update: {
        ...serviceData,
        startingPrice: serviceData.startingPrice ?? null,
        deliveryDaysMin: serviceData.deliveryDaysMin ?? null,
        deliveryDaysMax: serviceData.deliveryDaysMax ?? null,
      },
      create: {
        ...serviceData,
        startingPrice: serviceData.startingPrice ?? null,
        deliveryDaysMin: serviceData.deliveryDaysMin ?? null,
        deliveryDaysMax: serviceData.deliveryDaysMax ?? null,
      },
    });

    // Replace packages to keep seed idempotent
    await prisma.servicePackage.deleteMany({ where: { serviceId: service.id } });

    let sortOrder = 0;
    for (const pkg of packages ?? []) {
      const createdPkg = await prisma.servicePackage.create({
        data: {
          serviceId: service.id,
          name: pkg.name,
          price: pkg.price,
          currency: "EUR",
          deliveryDays: pkg.deliveryDays ?? null,
          isRecommended: pkg.isRecommended ?? false,
          isActive: true,
          sortOrder: sortOrder++,
        },
      });

      let itemOrder = 0;
      for (const text of pkg.items ?? []) {
        await prisma.servicePackageItem.create({
          data: {
            packageId: createdPkg.id,
            text,
            sortOrder: itemOrder++,
          },
        });
      }
    }
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

  // Seed CRM leads with tags and activities
  await prisma.leadActivity.deleteMany({});
  await prisma.leadTagJoin.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.leadTag.deleteMany({});

  const leadTags = ["Website", "High intent", "Follow-up", "Referral", "Spa", "Nail studio", "Corporate", "Needs demo"];
  const createdTags = await Promise.all(
    leadTags.map((name) =>
      prisma.leadTag.create({
        data: { name },
      }),
    ),
  );

  const leadSeeds = [
    {
      fullName: "Rasa New",
      email: "rasa@newlead.lt",
      company: "Rasa Salon",
      website: "https://rasa-salon.lt",
      message: "Looking for a new site with booking.",
      source: "website_form",
      priority: "MEDIUM",
      leadStatus: "NEW",
      budgetRange: "UNKNOWN",
      decisionMaker: "UNKNOWN",
      tags: ["Website"],
      activities: [{ type: "CREATED", message: "Lead captured from website form" }],
    },
    {
      fullName: "Contacted Spa",
      email: "hello@contactedspa.lt",
      company: "Vilnius Spa",
      message: "Needs redesign and booking system.",
      source: "referral",
      priority: "HIGH",
      leadStatus: "IN_PROGRESS",
      budgetRange: "BETWEEN_1000_AND_3000",
      decisionMaker: "DECISION_MAKER",
      lastContactedAt: new Date(),
      nextFollowUpAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      bantNeedConfirmed: true,
      tags: ["Spa", "Follow-up"],
      activities: [
        { type: "STATUS_CHANGED", message: "Moved to In Progress" },
        { type: "FOLLOWUP_SET", message: "Follow-up in 2 days" },
      ],
    },
    {
      fullName: "Appointment Ready",
      email: "meet@appointment.lt",
      company: "Meeting Studio",
      message: "Booked intro meeting next week.",
      source: "event",
      priority: "MEDIUM",
      leadStatus: "APPOINTMENT_SCHEDULED",
      meetingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      meetingType: "VIDEO",
      meetingLink: "https://meet.example.com/abc",
      budgetRange: "BETWEEN_1000_AND_3000",
      decisionMaker: "INFLUENCER",
      tags: ["Follow-up"],
      activities: [
        { type: "APPOINTMENT_SET", message: "Video call scheduled" },
        { type: "FOLLOWUP_SET", message: "Reminder for meeting" },
      ],
    },
    {
      fullName: "Qualified Buyer",
      email: "buy@qualified.lt",
      company: "Qualified Co",
      message: "Ready to move forward; needs final proposal.",
      source: "google_ads",
      priority: "HIGH",
      leadStatus: "QUALIFIED_TO_BUY",
      budgetRange: "BETWEEN_3000_AND_6000",
      decisionMaker: "DECISION_MAKER",
      mustHaveFeatures: ["Booking", "CRM integration"],
      referenceSites: [{ url: "https://example.com", note: "Likes the layout" }],
      bantBudgetConfirmed: true,
      bantAuthorityConfirmed: true,
      bantNeedConfirmed: true,
      bantTimelineConfirmed: true,
      leadScore: 85,
      nextFollowUpAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
      tags: ["High intent", "Website"],
      activities: [
        { type: "QUALIFIED", message: "Qualified to buy after discovery" },
        { type: "FOLLOWUP_SET", message: "Follow-up tomorrow for proposal" },
      ],
    },
    {
      fullName: "Bad Timing Lead",
      email: "later@timing.lt",
      company: "Later Co",
      message: "Interested but in three months.",
      source: "google_ads",
      priority: "MEDIUM",
      leadStatus: "BAD_TIMING",
      budgetRange: "BETWEEN_500_AND_1000",
      decisionMaker: "NEEDS_APPROVAL",
      nextFollowUpAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      tags: ["Follow-up"],
      activities: [{ type: "STATUS_CHANGED", message: "Marked as bad timing" }],
    },
    {
      fullName: "Not a Fit",
      email: "no@fit.lt",
      company: "Not Fit Ltd",
      message: "Needs mobile app, not website.",
      source: "referral",
      priority: "LOW",
      leadStatus: "NOT_A_FIT",
      budgetRange: "UNDER_500",
      decisionMaker: "UNKNOWN",
      disqualifyReason: "Needs mobile app",
      disqualifyNote: "Out of scope",
      tags: [],
      activities: [
        { type: "DISQUALIFIED", message: "Not a fit for services" },
        { type: "NOTE_ADDED", message: "Referred to partner agency" },
      ],
    },
  ];

  for (const lead of leadSeeds) {
    const tagIds = createdTags.filter((t) => lead.tags?.includes(t.name)).map((t) => t.id);
    await prisma.lead.create({
      data: {
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone ?? null,
        company: lead.company ?? null,
        website: lead.website ?? null,
        message: lead.message,
        source: lead.source ?? "website_form",
        serviceInterest: lead.serviceInterest ?? null,
        serviceId: undefined,
        priority: lead.priority as Prisma.LeadPriority,
        leadStatus: lead.leadStatus as Prisma.LeadStatus,
        unread: lead.unread ?? true,
        lastContactedAt: lead.lastContactedAt ?? null,
        nextFollowUpAt: lead.nextFollowUpAt ?? null,
        targetDeadline: lead.targetDeadline ?? null,
        mustHaveFeatures: lead.mustHaveFeatures ?? null,
        referenceSites: lead.referenceSites ?? null,
        decisionMaker: (lead.decisionMaker as Prisma.DecisionMaker) ?? "UNKNOWN",
        meetingAt: lead.meetingAt ?? null,
        meetingType: lead.meetingType as Prisma.MeetingType,
        meetingLink: lead.meetingLink ?? null,
        qualificationNotes: lead.qualificationNotes ?? null,
        bantBudgetConfirmed: lead.bantBudgetConfirmed ?? false,
        bantAuthorityConfirmed: lead.bantAuthorityConfirmed ?? false,
        bantNeedConfirmed: lead.bantNeedConfirmed ?? false,
        bantTimelineConfirmed: lead.bantTimelineConfirmed ?? false,
        leadScore: lead.leadScore ?? 0,
        disqualifyReason: lead.disqualifyReason ?? null,
        disqualifyNote: lead.disqualifyNote ?? null,
        score: lead.score ?? 0,
        spamScore: lead.spamScore ?? 0,
        tags: tagIds.length
          ? {
              create: tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
        activities: lead.activities?.length
          ? {
              create: lead.activities.map((a) => ({
                type: a.type,
                message: a.message,
              })),
            }
          : undefined,
      },
    });
  }

  // Seed projects workspace demo data
  await prisma.project.deleteMany({});
  await prisma.projectRequirement.deleteMany({});
  await prisma.projectMilestone.deleteMany({});
  await prisma.projectFile.deleteMany({});
  await prisma.projectDeployment.deleteMany({});
  await prisma.projectActivity.deleteMany({});

  const exampleProjects = [
    {
      name: "Salon Booking Platform",
      clientName: "Glow Studio",
      clientEmail: "hello@glowstudio.com",
      status: "DEVELOPMENT" as const,
      startDate: new Date(),
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      techStack: ["Next.js", "Prisma", "PostgreSQL", "Tailwind"],
      repoUrl: "https://github.com/example/salon-booking",
      stagingUrl: "https://staging.glowstudio.com",
      productionUrl: "https://glowstudio.com",
      scopeSummary: "Booking platform with service catalog, checkout, and CMS-backed pages.",
      isArchived: false,
      sortOrder: 0,
      requirements: [
        { group: "Auth", label: "Email/password login" },
        { group: "Auth", label: "Magic link login" },
        { group: "Products", label: "Service catalog with categories" },
        { group: "Checkout", label: "Card payments" },
        { group: "Checkout", label: "Gift card support" },
        { group: "Admin", label: "Manage bookings dashboard" },
        { group: "Admin", label: "Export bookings (CSV)" },
        { group: "SEO", label: "Meta + OG tags" },
        { group: "Deployment", label: "Staging environment" },
        { group: "Deployment", label: "CDN caching" },
        { group: "Analytics", label: "Track conversions" },
      ],
      milestones: [
        { title: "MVP scope lock", status: "DONE" },
        { title: "Bookings flow", status: "IN_PROGRESS" },
        { title: "UAT + launch", status: "NOT_STARTED" },
      ],
      files: [
        { name: "Figma design", url: "https://figma.com/file/demo", type: "FIGMA" as const },
        { name: "Contract", url: "https://example.com/contract.pdf", type: "CONTRACT" as const },
      ],
      deployments: [
        { environment: "STAGING" as const, versionTag: "v0.4.2", notes: "MVP booking flow" },
      ],
      activities: [
        { type: "STATUS_CHANGED", message: "Moved to DEVELOPMENT" },
        { type: "REQ_DONE", message: "Email/password login complete" },
        { type: "DEPLOYMENT", message: "Deployed v0.4.2 to staging" },
      ],
    },
    {
      name: "Wellness Portal Revamp",
      clientName: "North Wellness",
      clientEmail: "ops@northwellness.com",
      status: "DESIGN" as const,
      startDate: new Date(),
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      techStack: ["Next.js", "Tailwind", "Supabase"],
      repoUrl: "https://github.com/example/wellness-portal",
      stagingUrl: null,
      productionUrl: null,
      scopeSummary: "Marketing site + gated portal for members with resources and updates.",
      isArchived: false,
      sortOrder: 1,
      requirements: [
        { group: "Content", label: "CMS for blog/resources" },
        { group: "Auth", label: "SSO for members" },
        { group: "Portal", label: "Resource library" },
        { group: "Portal", label: "Announcements feed" },
        { group: "SEO", label: "Schema and meta" },
        { group: "Deployment", label: "Preview links for pages" },
        { group: "Analytics", label: "Pageview tracking" },
        { group: "Brand", label: "Theme tokens" },
        { group: "Assets", label: "Optimized hero images" },
        { group: "Contact", label: "Lead form with notifications" },
      ],
      milestones: [
        { title: "Design system", status: "IN_PROGRESS" },
        { title: "Marketing pages", status: "NOT_STARTED" },
        { title: "Portal MVP", status: "NOT_STARTED" },
      ],
      files: [
        { name: "Sitemap", url: "https://example.com/sitemap.pdf", type: "DOC" as const },
        { name: "Brand assets", url: "https://example.com/brand.zip", type: "ASSET" as const },
      ],
      deployments: [],
      activities: [
        { type: "STATUS_CHANGED", message: "Moved to DESIGN" },
        { type: "REQ_ADDED", message: "Added portal requirements" },
      ],
    },
  ];

  for (const proj of exampleProjects) {
    const project = await prisma.project.create({
      data: {
        name: proj.name,
        clientName: proj.clientName,
        clientEmail: proj.clientEmail,
        status: proj.status as any,
        startDate: proj.startDate,
        deadline: proj.deadline,
        techStack: proj.techStack,
        repoUrl: proj.repoUrl,
        stagingUrl: proj.stagingUrl,
        productionUrl: proj.productionUrl,
        scopeSummary: proj.scopeSummary,
        isArchived: proj.isArchived,
        sortOrder: proj.sortOrder,
        requirements: {
          create: proj.requirements.map((r, idx) => ({
            group: r.group,
            label: r.label,
            sortOrder: idx,
          })),
        },
        milestones: {
          create: proj.milestones.map((m, idx) => ({
            title: m.title,
            status: m.status as any,
            sortOrder: idx,
          })),
        },
        files: {
          create: proj.files.map((f) => ({
            name: f.name,
            url: f.url,
            type: f.type as any,
          })),
        },
        deployments: {
          create: proj.deployments.map((d) => ({
            environment: d.environment as any,
            versionTag: d.versionTag,
            notes: d.notes,
          })),
        },
        activities: {
          create: proj.activities.map((a) => ({
            type: a.type,
            message: a.message,
          })),
        },
      },
    });
    console.log("Seeded project", project.name);
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
