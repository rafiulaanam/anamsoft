"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface ContactFormProps {
  onSuccess?: () => void;
}

export function ContactForm({ onSuccess }: ContactFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [salonName, setSalonName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedSalonName = salonName.trim();
    const trimmedEmail = email.trim();
    const trimmedWebsite = website.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedSalonName || !trimmedEmail || !trimmedMessage) {
      toast({
        title: "Missing details",
        description: "Name, salon name, email and message are required.",
        variant: "destructive",
      });
      return;
    }
    if (trimmedMessage.length < 10) {
      toast({
        title: "Message is too short",
        description: "Please add at least 10 characters so I can help.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: trimmedName,
          company: trimmedSalonName,
          email: trimmedEmail,
          website: trimmedWebsite || undefined,
          message: trimmedMessage,
          source: "contact_page",
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = extractErrorDetail(payload);
        throw new Error(detail);
      }

      setName("");
      setSalonName("");
      setEmail("");
      setWebsite("");
      setMessage("");
      toast({ title: "Thanks!", description: "I’ll reply to you soon." });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Could not send message",
        description: error?.message ?? "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  function extractErrorDetail(payload: Record<string, any>) {
    if (!payload) return "Failed to send your message.";
    if (payload?.details) {
      const { formErrors, fieldErrors } = payload.details;
      if (Array.isArray(formErrors) && formErrors.length) return String(formErrors[0]);
      if (fieldErrors && typeof fieldErrors === "object") {
        const messages = Object.values(fieldErrors)
          .flat()
          .filter((value) => typeof value === "string" && value.length > 0)
          .map(String);
        if (messages.length) return messages[0];
      }
    }
    if (typeof payload.error === "string" && payload.error.length) return payload.error;
    if (payload?.error?.message) return String(payload.error.message);
    return "Failed to send your message.";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salonName">Salon name *</Label>
          <Input
            id="salonName"
            name="salonName"
            value={salonName}
            onChange={(event) => setSalonName(event.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Current website (optional)</Label>
        <Input
          id="website"
          name="website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          placeholder="https://"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">How can I help? *</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send message"}
        </Button>
      </div>
    </form>
  );
}
