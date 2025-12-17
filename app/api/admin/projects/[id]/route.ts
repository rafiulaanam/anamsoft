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

function parseDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseTechStack(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
}

const projectStatuses = new Set(Object.values(ProjectStatus));

const defaultInclude = {
  requirements: { orderBy: { sortOrder: "asc" } },
  milestones: { orderBy: { sortOrder: "asc" } },
  files: { orderBy: { createdAt: "desc" } },
  deployments: { orderBy: { deployedAt: "desc" } },
  activities: { orderBy: { createdAt: "desc" } },
};

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { prisma } = await import("@/lib/db");
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: defaultInclude,
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ data: project });
  } catch (error) {
    console.error("Error fetching project", error);
    return NextResponse.json({ error: "Unable to fetch project" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { prisma } = await import("@/lib/db");
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (typeof body?.name === "string" && body.name.trim()) {
      data.name = body.name.trim();
    }
    if (typeof body?.slug === "string" && body.slug.trim()) {
      data.slug = slugify(body.slug);
    }
    if (typeof body?.clientName === "string") {
      data.clientName = body.clientName.trim() || null;
    }
    if (typeof body?.clientEmail === "string") {
      data.clientEmail = body.clientEmail.trim() || null;
    }
    if (typeof body?.status === "string" && projectStatuses.has(body.status as ProjectStatus)) {
      data.status = body.status;
    }
    if (typeof body?.scopeSummary === "string") {
      data.scopeSummary = body.scopeSummary;
    }
    const techStack = parseTechStack(body?.techStack);
    if (techStack) {
      data.techStack = techStack;
    }
    if (typeof body?.repoUrl === "string") {
      data.repoUrl = body.repoUrl || null;
    }
    if (typeof body?.stagingUrl === "string") {
      data.stagingUrl = body.stagingUrl || null;
    }
    if (typeof body?.productionUrl === "string") {
      data.productionUrl = body.productionUrl || null;
    }
    const startDate = parseDate(body?.startDate);
    if (startDate !== null) {
      data.startDate = startDate;
    }
    const deadline = parseDate(body?.deadline);
    if (deadline !== null) {
      data.deadline = deadline;
    }

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data,
      include: defaultInclude,
    });

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error("Error updating project", error);
    return NextResponse.json({ error: "Unable to update project" }, { status: 500 });
  }
}
