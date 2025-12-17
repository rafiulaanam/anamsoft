"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
};

export function ImageUploadField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  helperText,
}: Props) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string>(value || "");

  useEffect(() => {
    setPreview(value || "");
  }, [value]);

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Upload failed", description: "Please choose an image file.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString() ?? "";
      setPreview(result);
      onChange(result);
      toast({ title: "Image added", description: "This is a temporary data URL. Wire storage later." });
    };
    reader.onerror = () => {
      toast({ title: "Upload failed", description: "Could not read the file.", variant: "destructive" });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handlePick} disabled={disabled}>
            Upload
          </Button>
          {preview && (
            <Button type="button" variant="outline" size="sm" onClick={handleRemove} disabled={disabled}>
              Remove
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={disabled}
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder ?? "https://..."}
      />
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
      {preview && (
        <div className="overflow-hidden rounded-md border">
          <div className="relative h-40 w-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              className={cn("object-cover")}
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
