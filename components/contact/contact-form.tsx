"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";
import { AIProjectDescriptionButton } from "@/components/ai/ai-project-description-button";

const reasons = [
  "New website project",
  "Redesign existing site",
  "Fix / improve my current site",
  "I’m not sure yet",
];

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    businessName: "",
    websiteUrl: "",
    budgetRange: "Not sure yet",
    howHeard: "",
    reason: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatus("idle");
    if (!form.reason) {
      setError("Please select what you need help with.");
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit");
      }
      setStatus("success");
      setForm({
        name: "",
        email: "",
        businessName: "",
        websiteUrl: "",
        budgetRange: "Not sure yet",
        howHeard: "",
        reason: "",
        message: "",
      });
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-900">What do you need help with? *</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {reasons.map((r) => {
            const active = form.reason === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleChange("reason", r)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  active
                    ? "border-blush-400 bg-blush-50 text-blush-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blush-200 hover:text-blush-700"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">Full name *</label>
          <Input
            required
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">Email *</label>
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">Business name</label>
          <Input
            value={form.businessName}
            onChange={(e) => handleChange("businessName", e.target.value)}
            placeholder="Salon / business name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">Current website</label>
          <Input
            value={form.websiteUrl}
            onChange={(e) => handleChange("websiteUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">Budget range</label>
        <select
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blush-200"
          value={form.budgetRange}
          onChange={(e) => handleChange("budgetRange", e.target.value)}
        >
          <option>Not sure yet</option>
          <option>Up to €1000</option>
          <option>€1000–€3000</option>
          <option>€3000+</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">How did you hear about AnamSoft?</label>
        <Input
          value={form.howHeard}
          onChange={(e) => handleChange("howHeard", e.target.value)}
          placeholder="Google, referral, Instagram, etc."
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-medium text-slate-900">Message *</label>
          <AIProjectDescriptionButton
            defaultBusinessName={form.businessName}
            defaultBusinessType="Salon"
            defaultLocation="Vilnius"
            onDescriptionGenerated={(text) =>
              setForm((prev) => ({ ...prev, message: prev.message ? `${prev.message}\n\n${text}` : text }))
            }
          />
        </div>
        <Textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
          placeholder="Tell me what you want to build or improve."
        />
      </div>

      {status === "success" && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle className="h-4 w-4" /> Thanks! I’ll reply as soon as possible (usually within 24 hours).
        </div>
      )}
      {status === "error" && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error || "Something went wrong. Please try again or email hello@anamsoft.com."}
        </div>
      )}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
