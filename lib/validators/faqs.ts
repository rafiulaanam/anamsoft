import { z } from "zod";

export const FaqCreateSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  sortOrder: z
    .coerce.number()
    .int("Sort order must be an integer")
    .nonnegative("Sort order cannot be negative")
    .optional(),
  isPublished: z.boolean().optional(),
});

export const FaqUpdateSchema = FaqCreateSchema.partial();
