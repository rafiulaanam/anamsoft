"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface AIProjectDescriptionButtonProps {
  onDescriptionGenerated: (text: string) => void;
  defaultBusinessName?: string;
  defaultBusinessType?: string;
  defaultLocation?: string;
}

export function AIProjectDescriptionButton({
  onDescriptionGenerated,
  defaultBusinessName = "",
  defaultBusinessType = "",
  defaultLocation = "Vilnius",
}: AIProjectDescriptionButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [businessName, setBusinessName] = useState(defaultBusinessName);
  const [businessType, setBusinessType] = useState(defaultBusinessType);
  const [location, setLocation] = useState(defaultLocation);
  const [mainGoal, setMainGoal] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [tone, setTone] = useState<"simple" | "professional" | "friendly">("friendly");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    try {
      setLoading(true);
      const res = await fetch("/api/ai/project-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          businessType,
          location,
          mainGoal,
          extraInfo,
          tone,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate description");
      }

      const data = await res.json().catch(() => ({}));
      const generated = data?.description?.toString().trim();

      if (generated) {
        onDescriptionGenerated(generated);
        toast({
          title: "Description generated",
          description: "You can review and edit the text before sending.",
        });
        setOpen(false);
        return;
      }

      throw new Error("No description returned");
    } catch (error) {
      console.error(error);
      // graceful fallback text so the box is not empty
      const fallbackParts = [
        `${businessName || "Our"} ${businessType || "business"} in ${location || "your city"} wants a modern website.`,
        `Main goal: ${mainGoal || "get more bookings and look more professional"}.`,
        extraInfo ? `Notes: ${extraInfo}` : "",
      ].filter(Boolean);

      const fallback =
        fallbackParts.join(" ").trim() ||
        "We need a clear, modern website to showcase our services, take bookings, and improve our online presence.";

      onDescriptionGenerated(fallback);

      toast({
        title: "Error",
        description:
          "Could not generate description via AI. We added a simple starter text—you can edit it before sending.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Help me describe my project (AI)
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Help me describe my project</DialogTitle>
              <DialogDescription>
                Answer a few quick questions and we&apos;ll generate a short project description for you.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Business name</Label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Master Cut"
                />
              </div>

              <div className="space-y-1">
                <Label>Business type</Label>
                <Input
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="Hair salon, nail studio, beauty spa..."
                />
              </div>

              <div className="space-y-1">
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Vilnius" />
              </div>

              <div className="space-y-1">
                <Label>Main goal for the website</Label>
                <Input
                  value={mainGoal}
                  onChange={(e) => setMainGoal(e.target.value)}
                  placeholder="Get more online bookings, look more professional..."
                />
              </div>

              <div className="space-y-1">
                <Label>Anything else important? (optional)</Label>
                <Textarea
                  value={extraInfo}
                  onChange={(e) => setExtraInfo(e.target.value)}
                  rows={3}
                  placeholder="For example: I want to show my price list, gallery, Instagram link..."
                />
              </div>

              <div className="space-y-1">
                <Label>Tone</Label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as "simple" | "professional" | "friendly")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="simple">Very simple</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating..." : "Generate description"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
