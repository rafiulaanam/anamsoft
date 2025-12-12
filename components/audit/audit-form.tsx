"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const PROBLEMS = [
  "Not enough bookings from the website",
  "Website looks old / not modern",
  "Bad on mobile",
  "Slow or confusing",
  "Hard to find important info",
];

export default function AuditForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    businessName: "",
    websiteUrl: "",
    businessType: "",
    mainProblems: [] as string[],
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleProblem = (problem: string) => {
    setForm((prev) => ({
      ...prev,
      mainProblems: prev.mainProblems.includes(problem)
        ? prev.mainProblems.filter((p) => p !== problem)
        : [...prev.mainProblems, problem],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus("idle");
    if (!form.name || !form.email || !form.websiteUrl) {
      setError("Name, email, and website URL are required.");
      setLoading(false);
      return;
    }
    if (form.mainProblems.length === 0) {
      setError("Please select at least one main problem.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/website-audit", {
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
        businessType: "",
        mainProblems: [],
        notes: "",
      });
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">Name *</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">Email *</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">Business name</label>
          <Input
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            placeholder="Salon / business name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">Website URL *</label>
          <Input
            value={form.websiteUrl}
            onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
            placeholder="https://..."
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">Business type</label>
        <Input
          value={form.businessType}
          onChange={(e) => setForm({ ...form, businessType: e.target.value })}
          placeholder="Hair salon, nail studio, spa, etc."
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-900">Main problems (choose at least one)</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {PROBLEMS.map((problem) => (
            <label key={problem} className="flex items-start gap-2 rounded-lg border p-3 text-sm">
              <Checkbox checked={form.mainProblems.includes(problem)} onCheckedChange={() => toggleProblem(problem)} />
              <span>{problem}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">Notes (optional)</label>
        <Textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={4}
          placeholder="Anything else you want me to know?"
        />
      </div>

      {status === "success" && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Thanks! I’ll review your website and email you 3–5 suggestions within 1–2 working days.
        </div>
      )}
      {status === "error" && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error || "Something went wrong. Please try again or email hello@anamsoft.com."}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Get my free audit"}
      </Button>
    </form>
  );
}
