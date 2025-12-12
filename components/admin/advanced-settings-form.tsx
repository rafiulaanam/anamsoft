"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

type AdvancedSettings = {
  sendAdminLeadEmails: boolean;
  sendClientLeadEmails: boolean;
  dailyLeadSummaryEmail: boolean;
  autoFollowupEnabled: boolean;
  autoFollowupDays: number;
  markStaleAfterDays: number;
  defaultLocale: string;
  secondaryLocale: string | null;
  showLanguageSwitcher: boolean;
  aiFeaturesEnabled: boolean;
  aiDraftReplyEnabled: boolean;
};

const defaultState: AdvancedSettings = {
  sendAdminLeadEmails: true,
  sendClientLeadEmails: true,
  dailyLeadSummaryEmail: false,
  autoFollowupEnabled: false,
  autoFollowupDays: 3,
  markStaleAfterDays: 14,
  defaultLocale: "en",
  secondaryLocale: "",
  showLanguageSwitcher: true,
  aiFeaturesEnabled: false,
  aiDraftReplyEnabled: false,
};

export function AdvancedSettingsForm() {
  const { toast } = useToast();
  const [values, setValues] = useState<AdvancedSettings>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/advanced");
      const data = await res.json();
      if (data?.data) {
        setValues((prev) => ({
          ...prev,
          ...data.data,
          secondaryLocale: data.data.secondaryLocale ?? "",
        }));
      }
    } catch (error) {
      toast({ title: "Could not load settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/advanced", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          secondaryLocale: values.secondaryLocale || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings");
      }
      toast({ title: "Advanced settings updated." });
    } catch (error: any) {
      toast({ title: "Save failed", description: error?.message || "Please try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const onChange = (field: keyof AdvancedSettings, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Advanced settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure automation, notifications, languages, and future AI controls.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Email & notifications */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Email & notifications</h3>
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <ToggleRow
              label="Send me an email for each new lead"
              checked={values.sendAdminLeadEmails}
              onCheckedChange={(v) => onChange("sendAdminLeadEmails", v)}
            />
            <ToggleRow
              label="Send automatic thank-you email to the client"
              checked={values.sendClientLeadEmails}
              onCheckedChange={(v) => onChange("sendClientLeadEmails", v)}
            />
            <ToggleRow
              label="Send daily lead summary email"
              checked={values.dailyLeadSummaryEmail}
              onCheckedChange={(v) => onChange("dailyLeadSummaryEmail", v)}
            />
            <p className="text-xs text-muted-foreground">Daily summary and auto-thank-you can be enabled/disabled here.</p>
          </div>
        </section>

        {/* Lead automation */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Lead automation</h3>
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <ToggleRow
              label="Enable automatic follow-up for unanswered leads"
              checked={values.autoFollowupEnabled}
              onCheckedChange={(v) => onChange("autoFollowupEnabled", v)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="autoFollowupDays">Send follow-up after (days)</Label>
                <Input
                  id="autoFollowupDays"
                  type="number"
                  min={1}
                  max={90}
                  disabled={!values.autoFollowupEnabled}
                  value={values.autoFollowupDays}
                  onChange={(e) => onChange("autoFollowupDays", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="markStaleAfterDays">Mark lead as stale after (days)</Label>
                <Input
                  id="markStaleAfterDays"
                  type="number"
                  min={1}
                  max={365}
                  value={values.markStaleAfterDays}
                  onChange={(e) => onChange("markStaleAfterDays", Number(e.target.value))}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              These are configuration values for future automation. They won&apos;t send real follow-ups yet.
            </p>
          </div>
        </section>

        {/* Language */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Language & locale</h3>
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="defaultLocale">Default language</Label>
                <select
                  id="defaultLocale"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={values.defaultLocale}
                  onChange={(e) => onChange("defaultLocale", e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="lt">Lithuanian</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryLocale">Secondary language (optional)</Label>
                <select
                  id="secondaryLocale"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={values.secondaryLocale ?? ""}
                  onChange={(e) => onChange("secondaryLocale", e.target.value)}
                >
                  <option value="">None</option>
                  <option value="en">English</option>
                  <option value="lt">Lithuanian</option>
                </select>
              </div>
            </div>
            <ToggleRow
              label="Show language switcher on public site"
              checked={values.showLanguageSwitcher}
              onCheckedChange={(v) => onChange("showLanguageSwitcher", v)}
            />
            <p className="text-xs text-muted-foreground">
              Language options configure UI chrome; they do not automatically translate content.
            </p>
          </div>
        </section>

        {/* AI */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">AI & experiments</h3>
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <ToggleRow
              label="Enable AI features (beta)"
              checked={values.aiFeaturesEnabled}
              onCheckedChange={(v) => onChange("aiFeaturesEnabled", v)}
            />
            <ToggleRow
              label="Allow AI to draft email replies to leads"
              checked={values.aiDraftReplyEnabled}
              disabled={!values.aiFeaturesEnabled}
              onCheckedChange={(v) => onChange("aiDraftReplyEnabled", v)}
            />
            <p className="text-xs text-muted-foreground">
              Future options. They won&apos;t perform actions yet, but let you toggle features as they ship.
            </p>
          </div>
        </section>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving || loading} className="min-w-[140px]">
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4 rounded-md border border-transparent px-2 py-1.5", disabled && "opacity-60")}>
      <span className="text-sm text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
