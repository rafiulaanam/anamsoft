import { NextRequest, NextResponse } from "next/server";
import { ProjectStatus } from "@prisma/client";

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

function normalizeTechStack(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function parseDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

const projectStatuses = new Set(Object.values(ProjectStatus));

export async function GET() {
  try {
    const { prisma } = await import("@/lib/db");
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: projects });
  } catch (error) {
    console.error("Error fetching projects", error);
    return NextResponse.json({ error: "Unable to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/db");
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const slug = typeof body?.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(name);
    const status = typeof body?.status === "string" && projectStatuses.has(body.status as ProjectStatus)
      ? (body.status as ProjectStatus)
      : "PLANNING";
    const techStack = normalizeTechStack(body?.techStack);

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        clientName: typeof body?.clientName === "string" ? body.clientName.trim() || null : null,
        clientEmail: typeof body?.clientEmail === "string" ? body.clientEmail.trim() || null : null,
        status,
        scopeSummary: typeof body?.scopeSummary === "string" ? body.scopeSummary : "",
        techStack,
        repoUrl: typeof body?.repoUrl === "string" ? body.repoUrl || null : null,
        stagingUrl: typeof body?.stagingUrl === "string" ? body.stagingUrl || null : null,
        productionUrl: typeof body?.productionUrl === "string" ? body.productionUrl || null : null,
        startDate: parseDate(body?.startDate),
        deadline: parseDate(body?.deadline),
      },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project", error);
    return NextResponse.json({ error: "Unable to create project" }, { status: 500 });
  }
}
