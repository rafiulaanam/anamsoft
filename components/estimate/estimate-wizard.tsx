"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AIProjectDescriptionButton } from "@/components/ai/ai-project-description-button";

type Step = 1 | 2 | 3 | 4 | 5;

const businessTypes = ["Salon", "Clinic / wellness", "Local service", "E-commerce", "Other"];
const pageOptions = ["Home", "About", "Services", "Gallery/Portfolio", "Pricing", "Blog/News", "Contact"];
const featureOptions = [
  "Online booking integration",
  "Blog / news",
  "Multi-language",
  "Simple e-commerce",
  "Client portal",
  "Not sure yet",
];
const budgetOptions = ["Not sure yet", "Up to €1000", "€1000–€3000", "€3000+"];
const urgencyOptions = ["ASAP (this month)", "Within 2–3 months", "Just exploring"];

export function EstimateWizard() {
  const [step, setStep] = useState<Step>(1);
  const [businessType, setBusinessType] = useState<string>("");
  const [pages, setPages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<string>("Not sure yet");
  const [urgency, setUrgency] = useState<string>("Just exploring");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");
  const [currentSite, setCurrentSite] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ estimatedMin?: number; estimatedMax?: number; complexityScore?: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => (step / 5) * 100, [step]);

  const toggleSelection = (value: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  };

  const nextStep = () => setStep((s) => (s === 5 ? 5 : ((s + 1) as Step)));
  const prevStep = () => setStep((s) => (s === 1 ? 1 : ((s - 1) as Step)));

  const handleSubmit = async () => {
    setError(null);
    if (!name || !email) {
      setError("Please add your name and email.");
      return;
    }
    if (pages.length === 0 && features.length === 0) {
      setError("Select at least one page or feature.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          businessName,
          currentSite,
          businessType,
          pages,
          features,
          budgetRange,
          urgency,
          notes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Something went wrong.");
      }
      setResult({
        estimatedMin: json.estimatedMin,
        estimatedMax: json.estimatedMax,
        complexityScore: json.complexityScore,
      });
      setStep(5);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setBusinessType("");
    setPages([]);
    setFeatures([]);
    setBudgetRange("Not sure yet");
    setUrgency("Just exploring");
    setName("");
    setEmail("");
    setBusinessName("");
    setCurrentSite("");
    setNotes("");
    setResult(null);
    setError(null);
  };

  return (
    <Card className="rounded-3xl border bg-card shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold">Get a website estimate in 2 minutes</CardTitle>
        <CardDescription>Answer a few quick questions and we&apos;ll email you a range and next steps.</CardDescription>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
        </div>
        <div className="text-sm text-muted-foreground">Step {step} of 5</div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">What type of business?</p>
            <div className="flex flex-wrap gap-2">
              {businessTypes.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={businessType === type ? "default" : "outline"}
                  className={cn("rounded-full", businessType === type && "shadow-sm")}
                  onClick={() => setBusinessType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Which pages do you need?</p>
            <div className="flex flex-wrap gap-2">
              {pageOptions.map((page) => (
                <Button
                  key={page}
                  type="button"
                  variant={pages.includes(page) ? "default" : "outline"}
                  className={cn("rounded-full", pages.includes(page) && "shadow-sm")}
                  onClick={() => toggleSelection(page, pages, setPages)}
                >
                  {page}
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Any features you want?</p>
            <div className="flex flex-wrap gap-2">
              {featureOptions.map((feature) => (
                <Button
                  key={feature}
                  type="button"
                  variant={features.includes(feature) ? "default" : "outline"}
                  className={cn("rounded-full", features.includes(feature) && "shadow-sm")}
                  onClick={() => toggleSelection(feature, features, setFeatures)}
                >
                  {feature}
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Budget range</p>
                <div className="flex flex-wrap gap-2">
                  {budgetOptions.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={budgetRange === option ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setBudgetRange(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Urgency</p>
                <div className="flex flex-wrap gap-2">
                  {urgencyOptions.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={urgency === option ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setUrgency(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Your name *</p>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Email *</p>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Business / project name</p>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Master Cut"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Current website (optional)</p>
                <Input
                  value={currentSite}
                  onChange={(e) => setCurrentSite(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Notes (optional)</p>
                <AIProjectDescriptionButton
                  defaultBusinessName={businessName}
                  defaultBusinessType={businessType}
                  defaultLocation="Vilnius"
                  onDescriptionGenerated={(text) => setNotes((prev) => (prev ? `${prev}\n\n${text}` : text))}
                />
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anything specific you want to mention..."
              />
            </div>
          </div>
        )}

        {step === 5 && result && (
          <div className="space-y-3 text-sm">
            <Badge variant="outline">Estimate ready</Badge>
            <p className="text-lg font-semibold">
              Thanks, {name || "there"}! Based on your answers, similar projects typically fall between €
              {result.estimatedMin} and €{result.estimatedMax}.
            </p>
            <p className="text-muted-foreground">
              We&apos;ll review your details and email you from hello@anamsoft.com with next steps or a few quick
              questions.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={reset}>Start another</Button>
              <Button variant="outline" asChild>
                <a href="/contact">Talk to us</a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {step < 5 && (
        <CardFooter className="flex items-center justify-between">
          <Button variant="ghost" onClick={prevStep} disabled={step === 1}>
            Back
          </Button>
          {step < 4 && (
            <Button onClick={nextStep} variant="default">
              Next
            </Button>
          )}
          {step === 4 && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Calculating..." : "Get my estimate"}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
