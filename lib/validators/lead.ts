import { z } from "zod";

const AttachmentSchema = z.object({
  label: z.string().min(1, "Attachment label is required").max(200),
  url: z.string().url().optional(),
  type: z.string().max(60).optional(),
});

export const LeadSubmissionSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100, "Name is too long"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().max(40).optional(),
  website: z.string().max(250).optional(),
  company: z.string().max(150).optional(),
  serviceInterest: z.string().max(200).optional(),
  budgetRange: z.string().max(120).optional(),
  timeline: z.string().max(120).optional(),
  message: z.string().min(10, "Share a few more details").max(4000),
  attachments: z.array(AttachmentSchema).optional(),
  source: z.string().max(60).optional(),
  honeypot: z.string().optional(),
});

export type LeadSubmissionPayload = z.infer<typeof LeadSubmissionSchema>;
