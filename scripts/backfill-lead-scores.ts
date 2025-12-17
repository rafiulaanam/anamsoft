import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.lead.findMany({
    where: {
      leadScore: { lte: 0 },
      score: { gt: 0 },
    },
    select: {
      id: true,
      score: true,
    },
  });

  if (!leads.length) {
    console.log("No leads require updating.");
    return;
  }

  for (const lead of leads) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { leadScore: lead.score },
    });
    console.log(`Backfilled leadScore for ${lead.id}`);
  }

  console.log(`Backfilled ${leads.length} lead(s).`);
}

main()
  .catch((error) => {
    console.error("Backfill failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
