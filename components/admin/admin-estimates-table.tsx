"use client";

import { useEffect, useState } from "react";
import type { ProjectEstimate } from "@prisma/client";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface AdminEstimatesTableProps {
  estimates: (ProjectEstimate & { createdAt: string | Date })[];
}

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function AdminEstimatesTable({ estimates }: AdminEstimatesTableProps) {
  const [selected, setSelected] = useState<ProjectEstimate | null>(null);
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [inReplyTo, setInReplyTo] = useState<string>("");
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selected) {
      setSubject(`Website estimate for ${selected.salonName || "your website"}`);
      setMessage("");
      setInReplyTo("");
    } else {
      setSubject("");
      setMessage("");
      setInReplyTo("");
    }
  }, [selected]);

  const sendReply = async () => {
    if (!selected) return;
    if (!subject.trim() || !message.trim()) {
      toast({
        variant: "destructive",
        title: "Subject and message are required.",
      });
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/estimates/${selected.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          body: message.trim(),
          inReplyTo: inReplyTo.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to send reply");
      }
      toast({ title: "Email sent", description: "Your reply was emailed to the lead." });
      setMessage("");
      setSubject("");
      setInReplyTo("");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Could not send reply",
        description: err?.message || "Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const draftWithAI = async () => {
    if (!selected) return;
    setIsDrafting(true);
    try {
      const res = await fetch(`/api/admin/estimates/${selected.id}/draft-reply`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to draft reply");
      }
      const data = await res.json();
      if (data.subject) setSubject(data.subject);
      if (data.body) setMessage(data.body);
      toast({
        title: "Draft ready",
        description: "AI generated a reply draft. Review and edit before sending.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Could not generate draft",
        description: err?.message || "Please try again.",
      });
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Salon</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Business type</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estimates.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                  No project estimates yet.
                </TableCell>
              </TableRow>
            )}

            {estimates.map((estimate) => (
              <TableRow key={estimate.id}>
                <TableCell className="whitespace-nowrap text-xs md:text-sm">
                  {estimate.createdAt ? formatDate(estimate.createdAt) : "-"}
                </TableCell>
                <TableCell className="text-xs md:text-sm">{estimate.name}</TableCell>
                <TableCell className="text-xs md:text-sm">{estimate.salonName || "-"}</TableCell>
                <TableCell className="text-xs md:text-sm">{estimate.email}</TableCell>
                <TableCell className="text-xs md:text-sm">{estimate.businessType}</TableCell>
                <TableCell className="text-xs md:text-sm">
                  <Badge variant="outline">{estimate.budgetRange}</Badge>
                </TableCell>
                <TableCell className="text-xs md:text-sm">{estimate.timeline}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setSelected(estimate)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Project estimate details</DialogTitle>
            <DialogDescription>Full information submitted by the client.</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">
                  {selected.name}{" "}
                  {selected.salonName && <span className="text-muted-foreground">· {selected.salonName}</span>}
                </p>
                <p className="text-muted-foreground">
                  {selected.email}
                  {selected.websiteUrl && (
                    <>
                      {" · "}
                      <a href={selected.websiteUrl} target="_blank" rel="noreferrer" className="underline">
                        Website
                      </a>
                    </>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Business type</p>
                  <p>{selected.businessType}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Budget</p>
                  <p>{selected.budgetRange}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Timeline</p>
                  <p>{selected.timeline}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Booking setup</p>
                  <p>{selected.bookingSetup || "-"}</p>
                </div>
              </div>

              {selected.pagesNeeded && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Pages needed</p>
                  <p>{selected.pagesNeeded}</p>
                </div>
              )}

              {selected.goals && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Goals</p>
                  <p>{selected.goals}</p>
                </div>
              )}

              <div className="pt-3 space-y-2 border-t">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase text-muted-foreground">Reply by email</p>
                  <Button size="sm" variant="outline" type="button" onClick={draftWithAI} disabled={isDrafting}>
                    {isDrafting ? "Drafting..." : "Draft reply with AI"}
                  </Button>
                </div>
                <Input
                  placeholder={`Website estimate for ${selected.salonName || "your website"}`}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <Input
                  placeholder="Optional: Message-ID to thread (In-Reply-To)"
                  value={inReplyTo}
                  onChange={(e) => setInReplyTo(e.target.value)}
                />
                <Textarea
                  placeholder="Write your reply..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={sendReply} disabled={isSending}>
                    {isSending ? "Sending..." : "Send reply"}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Reply is emailed from {process.env.NEXT_PUBLIC_FROM_EMAIL || "hello@anamsoft.com"}. Add a prior
                  Message-ID above to thread in the same conversation (optional). Client replies will arrive in your
                  inbox.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
