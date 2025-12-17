"use client";

import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Mail, MessageCircle, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type LeadRowActionsProps = {
  leadId: string;
  leadPhone?: string | null;
  onOpen: () => void;
  onReply?: (leadId: string) => void;
  showDraft?: boolean;
  onDraft?: () => void;
};

export function LeadRowActions({ leadId, leadPhone, onOpen, onReply, showDraft, onDraft }: LeadRowActionsProps) {
  const { toast } = useToast();
  const normalizedPhone = leadPhone?.replace(/\D/g, "") ?? "";
  const whatsappHref = normalizedPhone ? `https://wa.me/${normalizedPhone}` : undefined;

  const handleReply = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (onReply) {
      onReply(leadId);
      return;
    }
    toast({ title: "Reply modal not wired" });
    console.info("Reply flow not configured yet for lead", leadId);
  };

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onOpen();
  };

  const handleDraft = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onDraft?.();
  };

  const handleWhatsApp = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!whatsappHref) return;
    if (typeof window !== "undefined") {
      window.open(whatsappHref, "_blank");
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleReply}
        className="text-slate-500 hover:text-slate-900"
        aria-label="Reply to lead"
        title="Reply to lead"
      >
        <Mail className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleWhatsApp}
        disabled={!whatsappHref}
        className={whatsappHref ? "text-emerald-600 hover:text-green-700" : "text-emerald-500/40"}
        aria-label="Open WhatsApp chat"
        title={whatsappHref ? "Open WhatsApp chat" : "Phone number missing"}
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        className="text-slate-500 hover:text-slate-900"
        aria-label="Open lead"
        title="Open lead"
      >
        <Eye className="h-4 w-4" />
      </Button>
      {showDraft && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleDraft}
          className="text-amber-500/80 hover:text-amber-700"
          aria-label="Draft reply with AI"
          title="Draft reply with AI"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
