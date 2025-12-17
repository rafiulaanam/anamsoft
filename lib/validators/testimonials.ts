import { z } from "zod";

export const TestimonialCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subtitle: z.string().optional().nullable(),
  quote: z.string().min(1, "Quote is required"),
  avatarUrl: z.string().url().optional().nullable(),
  rating: z
    .coerce.number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5")
    .optional(),
  sortOrder: z
    .coerce.number()
    .int("Sort order must be an integer")
    .nonnegative("Sort order cannot be negative")
    .optional(),
  isPublished: z.boolean().optional(),
});

export const TestimonialUpdateSchema = TestimonialCreateSchema.partial();
