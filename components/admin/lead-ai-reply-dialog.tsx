"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles } from "lucide-react";
import type { LeadRow } from "@/types/lead";

type LeadAiReplyDialogProps = {
  lead: LeadRow | null;
  open: boolean;
  onClose: () => void;
};

export function LeadAiReplyDialog({ lead, open, onClose }: LeadAiReplyDialogProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const { toast } = useToast();

  const defaultSubject = useMemo(() => {
    if (!lead) return "";
    return `Website reply for ${lead.fullName}`;
  }, [lead]);

  const defaultBody = useMemo(() => {
    if (!lead) return "";
    const lines = [
      `Hi ${lead.fullName},`,
      lead.serviceInterest ? `Thanks for reaching out about ${lead.serviceInterest}.` : "Thanks for the note!",
      lead.budgetRange ? `Budget range: ${lead.budgetRange}.` : undefined,
      lead.message ? `You mentioned: "${lead.message.slice(0, 200)}"` : undefined,
    ].filter(Boolean);
    return lines.join("\n\n");
  }, [lead]);

  useEffect(() => {
    setSubject(defaultSubject);
    setBody(defaultBody);
  }, [defaultBody, defaultSubject]);

  const handleGenerate = () => {
    toast({ title: "Draft ready", description: "AI-inspired reply prefilled. Tweak before sending." });
  };

  const handleCopy = async () => {
    if (body) {
      await navigator.clipboard?.writeText(body);
      toast({ title: "Copied", description: "Draft copied to clipboard." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" /> AI draft reply
          </DialogTitle>
          <DialogDescription>Fine-tune the suggested reply before sending.</DialogDescription>
        </DialogHeader>
        {lead ? (
          <div className="space-y-4">
            <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" />
            <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={6} />
            <div className="flex justify-between">
              <Button size="sm" variant="outline" onClick={handleCopy} disabled={!body}>
                Copy draft
              </Button>
              <Button size="sm" onClick={handleGenerate}>
                Refresh with AI
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
