"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const pageOptions = ["Home", "Services", "Prices", "Gallery", "About", "Contact", "Blog/News"];

const businessTypes = [
  "Hair salon",
  "Nail studio",
  "Spa & wellness",
  "Barber shop",
  "Other",
];

const bookingOptions = [
  "I don’t take online bookings yet",
  "WhatsApp / phone only",
  "I use an online system (Fresha, Treatwell, etc.)",
];

const budgetOptions = ["Not sure yet", "Up to 400 €", "400–800 €", "800–1500 €", "1500+ €"];
const timelineOptions = ["ASAP (this month)", "1–2 months", "3+ months"];

export function ProjectEstimatorWizard() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    businessType: "",
    salonName: "",
    websiteUrl: "",
    pagesNeeded: [] as string[],
    bookingSetup: "",
    budgetRange: "",
    timeline: "",
    goals: "",
    name: "",
    email: "",
  });

  const progress = useMemo(() => [0, 25, 50, 75, 100][step], [step]);

  const togglePage = (page: string) => {
    setForm((prev) => {
      const exists = prev.pagesNeeded.includes(page);
      return {
        ...prev,
        pagesNeeded: exists ? prev.pagesNeeded.filter((p) => p !== page) : [...prev.pagesNeeded, page],
      };
    });
  };

  const nextStep = () => {
    if (step === 1 && !form.businessType) {
      toast({ title: "Pick your business type", variant: "destructive" });
      return;
    }
    if (step === 3 && (!form.budgetRange || !form.timeline)) {
      toast({ title: "Select budget and timeline", variant: "destructive" });
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    if (!form.name || !form.email) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    if (!form.businessType || !form.budgetRange || !form.timeline) {
      toast({ title: "Please complete required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/project-estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not submit");
      }
      toast({
        title: "Thanks!",
        description: "I’ll review this and send you a tailored estimate.",
      });
      setForm({
        businessType: "",
        salonName: "",
        websiteUrl: "",
        pagesNeeded: [],
        bookingSetup: "",
        budgetRange: "",
        timeline: "",
        goals: "",
        name: "",
        email: "",
      });
      setStep(1);
    } catch (error: any) {
      toast({ title: "Submission failed", description: error?.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="estimate" className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <Badge className="bg-blush-100 text-blush-700 border border-blush-200">Project estimator</Badge>
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">Get a website estimate in 2 minutes</h2>
          <p className="text-slate-600">
            Answer a few quick questions and I’ll send you a tailored quote for your salon website.
          </p>
        </div>

        <Card className="rounded-3xl border shadow-sm">
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Step {step} of 4</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <CardContent className="space-y-6 py-6">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">About your salon</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800">Business type *</label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.businessType}
                    onChange={(e) => setForm((prev) => ({ ...prev, businessType: e.target.value }))}
                  >
                    <option value="">Select a business type</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-800">Salon name (optional)</label>
                    <Input
                      value={form.salonName}
                      onChange={(e) => setForm((prev) => ({ ...prev, salonName: e.target.value }))}
                      placeholder="Vilnius Lash Studio"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-800">Current website (optional)</label>
                    <Input
                      value={form.websiteUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Pages & booking</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800">Which pages do you need?</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {pageOptions.map((page) => (
                      <label key={page} className="flex items-center gap-2 text-sm text-slate-700">
                        <Checkbox
                          checked={form.pagesNeeded.includes(page)}
                          onChange={() => togglePage(page)}
                        />
                        <span>{page}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800">Booking setup</label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.bookingSetup}
                    onChange={(e) => setForm((prev) => ({ ...prev, bookingSetup: e.target.value }))}
                  >
                    <option value="">Select an option</option>
                    {bookingOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Budget, timeline & goals</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-800">Budget range *</label>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={form.budgetRange}
                      onChange={(e) => setForm((prev) => ({ ...prev, budgetRange: e.target.value }))}
                    >
                      <option value="">Select budget</option>
                      {budgetOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-800">Timeline *</label>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={form.timeline}
                      onChange={(e) => setForm((prev) => ({ ...prev, timeline: e.target.value }))}
                    >
                      <option value="">Select timeline</option>
                      {timelineOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800">
                    What would you like this new website to achieve?
                  </label>
                  <Textarea
                    value={form.goals}
                    onChange={(e) => setForm((prev) => ({ ...prev, goals: e.target.value }))}
                    placeholder="More bookings, better first impression, look professional on Google/Instagram…"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Your contact details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-800">Name *</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-800">Email *</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="you@salon.com"
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  I’ll review your answers and email you with a tailored estimate.
                </p>
              </div>
            )}
          </CardContent>

          <div className="flex items-center justify-between px-6 pb-6">
            <Button variant="outline" onClick={prevStep} disabled={step === 1}>
              Back
            </Button>
            {step < 4 ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button onClick={submit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit project details"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
