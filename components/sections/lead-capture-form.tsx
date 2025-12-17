"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface ServiceOption {
  id: string;
  label: string;
}

interface LeadCaptureFormProps {
  serviceOptions?: ServiceOption[];
  source?: string;
  submitLabel?: string;
  className?: string;
}

export function LeadCaptureForm({
  serviceOptions = [],
  source,
  submitLabel = "Send message",
  className,
}: LeadCaptureFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    website: "",
    company: "",
    serviceInterest: "",
    budgetRange: "",
    timeline: "",
    message: "",
    attachments: "",
    honeypot: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "message" && error) {
      setError(null);
    }
  };

  const getAttachmentPayload = () => {
    return form.attachments
      .split("\n")
      .map((line) => line.trim())
      .filter((value) => value.length)
      .map((label) => ({ label }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const trimmedName = form.fullName.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setError("Name, email, and message are required.");
      return;
    }
    if (trimmedMessage.length < 10) {
      setError("Please add a few more details so I can help.");
      return;
    }

    setSubmitting(true);

    const payload: Record<string, unknown> = {
      fullName: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      phone: form.phone.trim() || undefined,
      website: form.website.trim() || undefined,
      company: form.company.trim() || undefined,
      serviceInterest: form.serviceInterest.trim() || undefined,
      budgetRange: form.budgetRange.trim() || undefined,
      timeline: form.timeline.trim() || undefined,
      source: source ?? "lead_form",
      honeypot: form.honeypot,
    };

    const attachmentsPayload = getAttachmentPayload();
    if (attachmentsPayload.length) {
      payload.attachments = attachmentsPayload;
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error || "Failed to send your message.";
        throw new Error(message);
      }
      toast({
        title: "Thanks!",
        description: "I’ve received your message and will follow up soon.",
      });
      router.push("/thank-you");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={className} onSubmit={handleSubmit} noValidate>
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        value={form.honeypot}
        onChange={(event) => handleChange("honeypot", event.target.value)}
        className="pointer-events-none absolute left-[-9999px] opacity-0"
        aria-hidden
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name *</Label>
          <Input
            id="fullName"
            placeholder="Your name"
            value={form.fullName}
            onChange={(event) => handleChange("fullName", event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="+370 611 04553"
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Business / salon</Label>
          <Input
            id="company"
            placeholder="Glow Studio"
            value={form.company}
            onChange={(event) => handleChange("company", event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website (if any)</Label>
        <Input
          id="website"
          placeholder="https://..."
          value={form.website}
          onChange={(event) => handleChange("website", event.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="serviceInterest">Service you need</Label>
          <Input
            id="serviceInterest"
            list={serviceOptions.length ? "service-options" : undefined}
            placeholder="Custom website, redesign, automation..."
            value={form.serviceInterest}
            onChange={(event) => handleChange("serviceInterest", event.target.value)}
          />
          {serviceOptions.length > 0 && (
            <datalist id="service-options">
              {serviceOptions.map((option) => (
                <option key={option.id} value={option.label} />
              ))}
            </datalist>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="budgetRange">Budget range</Label>
          <Input
            id="budgetRange"
            placeholder="Not sure yet / €1500 – €3000"
            value={form.budgetRange}
            onChange={(event) => handleChange("budgetRange", event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="timeline">Timeline</Label>
          <Input
            id="timeline"
            placeholder="Ready to launch in 4 weeks"
            value={form.timeline}
            onChange={(event) => handleChange("timeline", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="attachments">Attachments (optional)</Label>
          <Textarea
            id="attachments"
            placeholder="List files or URLs (one per line)"
            rows={2}
            value={form.attachments}
            onChange={(event) => handleChange("attachments", event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          rows={4}
          placeholder="Tell me the business goal, what’s working now, and any blockers."
          value={form.message}
          onChange={(event) => handleChange("message", event.target.value)}
          required
        />
      </div>

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Sending..." : submitLabel}
      </Button>
    </form>
  );
}
