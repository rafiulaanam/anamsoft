"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState as useActionState } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ProjectStatusValues, type ActionResult } from "@/lib/validators/project";

type FormValues = {
  name: string;
  slug: string;
  scopeSummary: string;
  status: string;
  clientName: string;
  clientEmail: string;
  repoUrl: string;
  stagingUrl: string;
  productionUrl: string;
  techStack: string;
  startDate: string;
  deadline: string;
};

type Props = {
  action: (prev: any, formData: FormData) => Promise<ActionResult<any>>;
  mode: "create" | "edit";
  initialValues?: Partial<FormValues>;
};

const initialState: ActionResult = { ok: false };

export function ProjectForm({ action, mode, initialValues }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const slugEdited = useRef(false);
  const [values, setValues] = useState<FormValues>({
    name: initialValues?.name ?? "",
    slug: initialValues?.slug ?? "",
    scopeSummary: initialValues?.scopeSummary ?? "",
    status: initialValues?.status ?? "PLANNING",
    clientName: initialValues?.clientName ?? "",
    clientEmail: initialValues?.clientEmail ?? "",
    repoUrl: initialValues?.repoUrl ?? "",
    stagingUrl: initialValues?.stagingUrl ?? "",
    productionUrl: initialValues?.productionUrl ?? "",
    techStack: initialValues?.techStack ?? "",
    startDate: initialValues?.startDate ?? "",
    deadline: initialValues?.deadline ?? "",
  });

  const [state, formAction, pending] = useActionState(action, initialState);
  const lastToastRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (slugEdited.current) return;
    const next = values.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (next && next !== values.slug) {
      setValues((prev) => ({ ...prev, slug: next }));
    }
  }, [values.name, values.slug]);

  useEffect(() => {
    if (!state.updatedAt) return;
    if (lastToastRef.current === state.updatedAt) return;
    lastToastRef.current = state.updatedAt;
    if (state.ok) {
      toast({ title: mode === "create" ? "Project created" : "Project updated" });
      if (mode === "create" && state.data?.id) {
        router.push(`/admin/projects/${state.data.id}`);
      } else {
        router.refresh();
      }
    } else if (state.message) {
      toast({ title: "Save failed", description: state.message, variant: "destructive" });
    }
  }, [mode, router, state, toast]);

  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{mode === "create" ? "Create project" : "Project details"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={values.name}
                onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
                disabled={pending}
              />
              {fieldError("name") && <FieldError message={fieldError("name")} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={values.slug}
                onChange={(e) => {
                  slugEdited.current = true;
                  setValues((p) => ({ ...p, slug: e.target.value }));
                }}
                disabled={pending}
              />
              {fieldError("slug") && <FieldError message={fieldError("slug")} />}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              name="scopeSummary"
              value={values.scopeSummary}
              onChange={(e) => setValues((p) => ({ ...p, scopeSummary: e.target.value }))}
              disabled={pending}
              rows={3}
            />
            {fieldError("scopeSummary") && <FieldError message={fieldError("scopeSummary")} />}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={values.status}
                onValueChange={(val) => setValues((p) => ({ ...p, status: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ProjectStatusValues.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError("status") && <FieldError message={fieldError("status")} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName">Client name</Label>
              <Input
                id="clientName"
                name="clientName"
                value={values.clientName}
                onChange={(e) => setValues((p) => ({ ...p, clientName: e.target.value }))}
                disabled={pending}
              />
              {fieldError("clientName") && <FieldError message={fieldError("clientName")} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={values.startDate}
                onChange={(e) => setValues((p) => ({ ...p, startDate: e.target.value }))}
                disabled={pending}
              />
              {fieldError("startDate") && <FieldError message={fieldError("startDate")} />}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                name="deadline"
                type="date"
                value={values.deadline}
                onChange={(e) => setValues((p) => ({ ...p, deadline: e.target.value }))}
                disabled={pending}
              />
              {fieldError("deadline") && <FieldError message={fieldError("deadline")} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client email</Label>
              <Input
                id="clientEmail"
                name="clientEmail"
                type="email"
                value={values.clientEmail}
                onChange={(e) => setValues((p) => ({ ...p, clientEmail: e.target.value }))}
                disabled={pending}
              />
              {fieldError("clientEmail") && <FieldError message={fieldError("clientEmail")} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="techStack">Tech stack (comma separated)</Label>
              <Input
                id="techStack"
                name="techStack"
                value={values.techStack}
                onChange={(e) => setValues((p) => ({ ...p, techStack: e.target.value }))}
                disabled={pending}
                placeholder="Next.js, Tailwind, Prisma"
              />
              {fieldError("techStack") && <FieldError message={fieldError("techStack")} />}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="repoUrl">Repo URL</Label>
              <Input
                id="repoUrl"
                name="repoUrl"
                type="url"
                value={values.repoUrl}
                onChange={(e) => setValues((p) => ({ ...p, repoUrl: e.target.value }))}
                disabled={pending}
              />
              {fieldError("repoUrl") && <FieldError message={fieldError("repoUrl")} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stagingUrl">Staging URL</Label>
              <Input
                id="stagingUrl"
                name="stagingUrl"
                type="url"
                value={values.stagingUrl}
                onChange={(e) => setValues((p) => ({ ...p, stagingUrl: e.target.value }))}
                disabled={pending}
              />
              {fieldError("stagingUrl") && <FieldError message={fieldError("stagingUrl")} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="productionUrl">Production URL</Label>
              <Input
                id="productionUrl"
                name="productionUrl"
                type="url"
                value={values.productionUrl}
                onChange={(e) => setValues((p) => ({ ...p, productionUrl: e.target.value }))}
                disabled={pending}
              />
              {fieldError("productionUrl") && <FieldError message={fieldError("productionUrl")} />}
            </div>
          </div>
        </CardContent>
      </Card>

      <input type="hidden" name="status" value={values.status} />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : mode === "create" ? "Create project" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}
