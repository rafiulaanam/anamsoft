"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FormState {
  name: string;
  salon: string;
  website: string;
  message: string;
}

const initialState: FormState = {
  name: "",
  salon: "",
  website: "",
  message: "",
};

const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z\.]{2,})([\/#?].*)?$/i;

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });

  const handleChange = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setStatus({ type: "idle" });
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Please enter your name.";
    if (!form.salon.trim()) nextErrors.salon = "Please enter your salon name.";
    if (!form.message.trim()) nextErrors.message = "Please share how I can help.";
    if (form.website.trim() && !urlPattern.test(form.website.trim())) {
      nextErrors.website = "Please enter a valid URL (e.g. https://example.com).";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus({ type: "success", message: "Thanks! I will reply with a tailored audit shortly." });
    setForm(initialState);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange("name")}
            placeholder="Your name"
            required
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="salon">Salon name *</Label>
          <Input
            id="salon"
            name="salon"
            value={form.salon}
            onChange={handleChange("salon")}
            placeholder="Studio or salon name"
            required
            aria-invalid={!!errors.salon}
          />
          {errors.salon && <p className="text-xs text-rose-600">{errors.salon}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Current website (optional)</Label>
        <Input
          id="website"
          name="website"
          type="url"
          value={form.website}
          onChange={handleChange("website")}
          placeholder="https://"
          aria-invalid={!!errors.website}
        />
        {errors.website && <p className="text-xs text-rose-600">{errors.website}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">How can I help? *</Label>
        <Textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange("message")}
          placeholder="Tell me about your salon and what you need."
          required
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="text-xs text-rose-600">{errors.message}</p>}
      </div>
      {status.type === "success" && (
        <div className="rounded-lg border border-blush-200 bg-blush-50 px-4 py-3 text-sm text-blush-800">
          {status.message}
        </div>
      )}
      <Button type="submit" size="lg" className="w-full hover:-translate-y-[1px]">
        Send message
      </Button>
    </form>
  );
}
