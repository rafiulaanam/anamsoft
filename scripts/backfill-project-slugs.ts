import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  // Find projects with missing/empty slug via raw Mongo command to avoid schema type issues.
  const res = (await prisma.$runCommandRaw({
    aggregate: "Project",
    pipeline: [
      { $match: { $or: [{ slug: null }, { slug: "" }, { slug: { $exists: false } }] } },
      { $project: { _id: 1, name: 1 } },
    ],
    cursor: {},
  })) as any;

  const docs: { _id: { $oid: string } | string; name?: string }[] = res?.cursor?.firstBatch ?? [];
  if (!docs.length) {
    console.log("No projects with missing slug found.");
    return;
  }

  const existingSlugs = new Set<string>();
  // Collect current slugs to avoid collisions
  const current = await prisma.project.findMany({ select: { slug: true } });
  current.forEach((p) => {
    if (p.slug) existingSlugs.add(p.slug);
  });

  for (const doc of docs) {
    const base = slugify(doc.name || "project");
    let candidate = base || `project`;
    let suffix = 1;
    while (existingSlugs.has(candidate)) {
      candidate = `${base || "project"}-${suffix++}`;
    }
    existingSlugs.add(candidate);

    const id = (doc._id as any)?.$oid || (doc._id as any);
    await prisma.$runCommandRaw({
      update: "Project",
      updates: [
        {
          q: { _id: { $oid: id } },
          u: { $set: { slug: candidate } },
          multi: false,
          upsert: false,
        },
      ],
    });
    console.log(`Updated project ${id} -> slug "${candidate}"`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
