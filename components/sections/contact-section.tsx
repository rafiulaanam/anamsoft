"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ContactSectionProps {
  email: string;
  whatsapp: string;
}

export function ContactSection({ email, whatsapp }: ContactSectionProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [salonName, setSalonName] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !salonName.trim() || !emailValue.trim() || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in your name, salon name, email and message.",
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
          name,
          salonName,
          email: emailValue,
          website: website || null,
          message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      toast({
        title: "Thanks! 🎉",
        description: "I’ll review your salon and get back to you soon at your email.",
      });
      setName("");
      setSalonName("");
      setEmailValue("");
      setWebsite("");
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Could not send message",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="w-full bg-gradient-to-br from-pink-50 to-white py-16"
    >
      <div className="max-w-5xl mx-auto px-4 grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] items-start">
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">Let’s talk about your salon website</h2>
          <p className="text-slate-600">
            Free review, no obligation, honest feedback for beauty and wellness sites.
          </p>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• Free website review</li>
            <li>• No obligation</li>
            <li>• Honest feedback</li>
          </ul>
          <div className="space-y-2 text-sm text-slate-700">
            <div>
              <span className="font-semibold">Email:</span> {" "}
              <a className="hover:text-blush-700" href={`mailto:${email}`}>
                {email}
              </a>
            </div>
            <div>
              <span className="font-semibold">WhatsApp:</span> {" "}
              <a
                className="hover:text-blush-700"
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
              >
                {whatsapp}
              </a>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-pink-50 bg-white shadow-soft p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
          <div className="space-y-2">
            <Label htmlFor="salonName">Salon name *</Label>
            <Input
              id="salonName"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Current website (optional)</Label>
          <Input
            id="website"
            value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">How can I help? *</Label>
              <Textarea
                id="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full text-base font-semibold py-6 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600"
            >
              {isSubmitting ? "Sending..." : "Send message"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
