"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { addProjectFileLink, deleteProjectFileLink } from "../_actions/files";

type FileLink = {
  id: string;
  name: string;
  url: string;
  type: string;
};

type Props = {
  projectId: string;
  files: FileLink[];
};

export function FilesPanel({ projectId, files }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", url: "", type: "DOC" });
  const lastToastRef = useRef<string | number | undefined>(undefined);

  const add = () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("url", form.url);
    fd.append("type", form.type);
    startTransition(async () => {
      const res = await addProjectFileLink(projectId, fd);
      const nonce = res?.nonce ?? res?.updatedAt ?? Date.now();
      if (lastToastRef.current !== nonce) {
        lastToastRef.current = nonce;
        toast({ title: res.ok ? "File added" : "Add failed", description: res.message, variant: res.ok ? "default" : "destructive" });
      }
      if (res.ok) {
        router.refresh();
        setForm({ name: "", url: "", type: "DOC" });
      }
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      if (!window.confirm("Delete this file?")) return;
      const res = await deleteProjectFileLink(id);
      const nonce = res?.nonce ?? res?.updatedAt ?? Date.now();
      if (lastToastRef.current !== nonce) {
        lastToastRef.current = nonce;
        toast({ title: res.ok ? "Removed" : "Remove failed", description: res.message, variant: res.ok ? "default" : "destructive" });
      }
      if (res.ok) router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Files</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr,1fr,140px]">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            disabled={pending}
          />
          <Input
            placeholder="URL"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            disabled={pending}
          />
          <div className="flex gap-2">
            <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {["FIGMA", "DOC", "CONTRACT", "INVOICE", "ASSET", "OTHER"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={add} disabled={pending || !form.name || !form.url}>
              Add
            </Button>
          </div>
        </div>

        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files yet.</p>
        ) : (
          <div className="space-y-2">
            {files.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{f.type}</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={f.url} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => remove(f.id)} disabled={pending}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
