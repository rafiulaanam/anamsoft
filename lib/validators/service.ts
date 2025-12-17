import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const PackageItemSchema = z.object({
  text: z.string().min(1, "Item text is required"),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const PackageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  price: z.coerce.number().positive("Price must be greater than zero"),
  currency: z.string().default("EUR"),
  deliveryDays: z.coerce.number().int().positive().optional(),
  isRecommended: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  items: z
    .array(PackageItemSchema)
    .min(2, "Each package must have at least 2 items"),
});

const baseServiceSchema = z
  .object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    slug: z
      .string()
      .min(2, "Slug must be at least 2 characters")
      .regex(slugRegex, "Slug must be URL-safe (lowercase, numbers, dashes)"),
    shortDescription: z.string().min(20, "Short description must be at least 20 characters"),
    description: z.string().min(1, "Description is required"),
    icon: z.string().optional(),
    imageUrl: z.string().url().optional(),
    startingPrice: z.coerce.number().positive().optional(),
    currency: z.string().default("EUR"),
    deliveryDaysMin: z.coerce.number().int().nonnegative().optional(),
    deliveryDaysMax: z.coerce.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    metaTitle: z.string().max(120, "Meta title must be 120 characters or less").optional(),
    metaDescription: z.string().max(300, "Meta description must be 300 characters or less").optional(),
    ogImageUrl: z.string().url().optional(),
    packages: z.array(PackageSchema).optional(),
  })
  .refine(
    (data) =>
      !(data.deliveryDaysMin !== undefined && data.deliveryDaysMax !== undefined) ||
      data.deliveryDaysMin <= data.deliveryDaysMax,
    {
      message: "Minimum delivery days must be less than or equal to maximum",
      path: ["deliveryDaysMin"],
    }
  )
  .refine(
    (data) => {
      if (!data.packages) return true;
      const recommended = data.packages.filter((p) => p.isRecommended);
      return recommended.length <= 1;
    },
    {
      message: "Only one package can be recommended per service",
      path: ["packages"],
    }
  );

export const ServiceCreateSchema = baseServiceSchema;

export const ServiceUpdateSchema = baseServiceSchema.partial().refine(
  (data) =>
    !(data.deliveryDaysMin !== undefined && data.deliveryDaysMax !== undefined) ||
    data.deliveryDaysMin <= data.deliveryDaysMax,
  {
    message: "Minimum delivery days must be less than or equal to maximum",
    path: ["deliveryDaysMin"],
  }
);

export type ActionResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};
