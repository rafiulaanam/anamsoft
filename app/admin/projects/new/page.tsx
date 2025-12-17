import { ProjectForm } from "../_components/project-form";
import { createProject } from "../_actions/projects";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New Project</h1>
        <p className="text-sm text-muted-foreground">Create a project in the main workspace.</p>
      </div>
      <ProjectForm action={createProject} mode="create" />
    </div>
  );
}
