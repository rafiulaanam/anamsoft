import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function PortalProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Defensive fetch to avoid hard crashes if the DB is unreachable
  const projects =
    (prisma as any).project?.findMany
      ? await prisma.project.findMany({
          where: { clientId: session.user.id },
          orderBy: { createdAt: "desc" },
        })
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My projects</h1>
        <p className="text-sm text-muted-foreground">
          View the status, updates, and content checklist for your projects.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.length === 0 && (
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader>
              <CardTitle>No projects yet</CardTitle>
              <CardDescription>Once your project is created, it will appear here.</CardDescription>
            </CardHeader>
          </Card>
        )}
        {projects.map((project) => (
          <Card key={project.id} className="rounded-2xl border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge variant="outline">{project.status}</Badge>
              </div>
              {project.summary && <CardDescription>{project.summary}</CardDescription>}
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{project.type || "Website project"}</span>
              <Link href={`/portal/projects/${project.id}`} className="text-pink-600 hover:text-pink-700">
                View details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
