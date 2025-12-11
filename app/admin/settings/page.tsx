"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SiteConfig {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  email: string;
  whatsapp?: string | null;
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [form, setForm] = useState<Partial<SiteConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/site-config");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        setConfig(data.data);
        setForm(data.data ?? {});
      } catch (err: any) {
        setError(err?.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!form.heroTitle || !form.heroSubtitle || !form.email) {
      setMessage("Hero title, subtitle, and email are required.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/site-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroTitle: form.heroTitle,
          heroSubtitle: form.heroSubtitle,
          email: form.email,
          whatsapp: form.whatsapp,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setConfig(data.data);
      setForm(data.data);
      setMessage("Settings saved.");
    } catch (err: any) {
      setMessage(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">Update hero copy and contact info.</p>
      </div>

      {loading && <p className="text-sm text-slate-600">Loading...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Site configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heroTitle">Hero title</Label>
            <Input
              id="heroTitle"
              value={form.heroTitle ?? ""}
              onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroSubtitle">Hero subtitle</Label>
            <Textarea
              id="heroSubtitle"
              value={form.heroSubtitle ?? ""}
              onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={form.whatsapp ?? ""}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
          </div>
          {message && <p className="text-sm text-blush-700">{message}</p>}
          <div className="flex justify-end gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
