import { z } from "zod";

export const ProjectStatusValues = ["PLANNING", "DESIGN", "DEVELOPMENT", "REVIEW", "DEPLOYED", "SUPPORT"] as const;

const urlOpt = z.string().url().optional();

export const RequirementSchema = z.object({
  group: z.string().min(1, "Group is required"),
  label: z.string().min(1, "Label is required"),
  isDone: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const MilestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dueDate: z.string().optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "DONE"]).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const FileLinkSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("URL must be valid"),
  type: z.enum(["FIGMA", "DOC", "CONTRACT", "INVOICE", "ASSET", "OTHER"]),
});

const baseProjectSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z
      .string()
      .min(2, "Slug must be at least 2 characters")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-safe (lowercase, numbers, dashes)"),
    clientName: z.string().optional(),
    clientEmail: z.string().email().optional(),
    leadId: z.string().optional(),
    status: z.enum(ProjectStatusValues).default("PLANNING"),
    startDate: z.string().optional(),
    deadline: z.string().optional(),
    techStack: z.array(z.string()).max(15, "Max 15 tech stack items").optional(),
    repoUrl: urlOpt,
    stagingUrl: urlOpt,
    productionUrl: urlOpt,
    scopeSummary: z.string().min(20, "Scope summary must be at least 20 characters"),
    isArchived: z.boolean().optional(),
    sortOrder: z.number().int().nonnegative().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.deadline) {
        const start = new Date(data.startDate);
        const end = new Date(data.deadline);
        return start <= end;
      }
      return true;
    },
    { path: ["deadline"], message: "Deadline must be on or after start date" }
  );

export const ProjectCreateSchema = baseProjectSchema;
export const ProjectUpdateSchema = baseProjectSchema.partial();

export type ProjectInput = z.infer<typeof ProjectCreateSchema>;
export type ActionResult<T = undefined> = {
  ok: boolean;
  message?: string;
  data?: T;
  fieldErrors?: Record<string, string>;
  updatedAt?: number;
  formError?: string;
  nonce?: string;
};
