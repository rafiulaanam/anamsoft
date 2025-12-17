"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState as useActionState } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { slugify } from "@/lib/slug";
import type { ServiceFormState, ServiceFormValues } from "../types";
import { ImageUploadField } from "./image-upload-field";

type ServiceFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<ServiceFormValues>;
  action: (
    prevState: ServiceFormState,
    formData: FormData
  ) => Promise<ServiceFormState> | ServiceFormState;
  showTabs?: boolean;
};

const initialState: ServiceFormState = { status: "idle" };

export function ServiceForm({ initialValues, action, mode, showTabs }: ServiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = useState<ServiceFormValues>(() => ({
    title: initialValues?.title ?? "",
    slug: initialValues?.slug ?? "",
    shortDescription: initialValues?.shortDescription ?? "",
    description: initialValues?.description ?? "",
    icon: initialValues?.icon ?? "",
    imageUrl: initialValues?.imageUrl ?? "",
    startingPrice: initialValues?.startingPrice ?? "",
    currency: initialValues?.currency ?? "EUR",
    deliveryDaysMin: initialValues?.deliveryDaysMin ?? "",
    deliveryDaysMax: initialValues?.deliveryDaysMax ?? "",
    isActive: initialValues?.isActive ?? true,
    sortOrder: initialValues?.sortOrder ?? "",
    metaTitle: initialValues?.metaTitle ?? "",
    metaDescription: initialValues?.metaDescription ?? "",
    ogImageUrl: initialValues?.ogImageUrl ?? "",
  }));

  const [state, formAction, pending] = useActionState(action, initialState);
  const slugEditedRef = useRef(Boolean(initialValues?.slug));
  const lastStatusRef = useRef<ServiceFormState["status"]>("idle");

  useEffect(() => {
    if (slugEditedRef.current) return;
    const nextSlug = slugify(values.title || "");
    if (nextSlug && nextSlug !== values.slug) {
      setValues((prev) => ({ ...prev, slug: nextSlug }));
    }
  }, [values.title, values.slug]);

  useEffect(() => {
    if (state.status === lastStatusRef.current) return;

    if (state.status === "success") {
      toast({
        title: mode === "create" ? "Service created" : "Service updated",
        description: mode === "create" ? "Redirecting to the service page..." : undefined,
      });
      if (mode === "create" && state.id) {
        router.push(`/admin/services/${state.id}`);
      } else {
        router.refresh();
      }
    } else if (state.status === "error" && state.message) {
      toast({ title: "Save failed", description: state.message, variant: "destructive" });
    }

    lastStatusRef.current = state.status;
  }, [mode, router, state, toast]);

  const setField = <K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const fieldError = (name: string) => state.fieldErrors?.[name];

  const detailsFields = (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">Service details</CardTitle>
        <p className="text-sm text-muted-foreground">
          Title, slug, descriptions, visuals, pricing, and delivery expectations.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={values.title}
              onChange={(e) => setField("title", e.target.value)}
              disabled={pending}
              placeholder="Website revamp"
            />
            {fieldError("title") && <FieldError message={fieldError("title")} />}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={values.slug}
              onChange={(e) => {
                slugEditedRef.current = true;
                setField("slug", e.target.value);
              }}
              disabled={pending}
              placeholder="website-revamp"
            />
            {fieldError("slug") && <FieldError message={fieldError("slug")} />}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short description</Label>
          <Textarea
            id="shortDescription"
            name="shortDescription"
            value={values.shortDescription}
            onChange={(e) => setField("shortDescription", e.target.value)}
            disabled={pending}
            rows={2}
            placeholder="One-liner used across cards and previews."
          />
          {fieldError("shortDescription") && <FieldError message={fieldError("shortDescription")} />}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            disabled={pending}
            rows={6}
            placeholder="Describe the service, scope, and what the client receives."
            className="leading-6"
          />
          {fieldError("description") && <FieldError message={fieldError("description")} />}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (optional)</Label>
            <Input
              id="icon"
              name="icon"
              value={values.icon}
              onChange={(e) => setField("icon", e.target.value)}
              disabled={pending}
              placeholder="sparkles"
            />
            {fieldError("icon") && <FieldError message={fieldError("icon")} />}
          </div>
          <div className="space-y-2">
            <ImageUploadField
              label="Image"
              value={values.imageUrl}
              onChange={(val) => setField("imageUrl", val)}
              disabled={pending}
              helperText="Upload an image or paste a URL. Uploads are stored as data URLs until storage is wired."
            />
            {fieldError("imageUrl") && <FieldError message={fieldError("imageUrl")} />}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr,auto,auto]">
          <div className="space-y-2">
            <Label htmlFor="startingPrice">Starting price</Label>
            <Input
              id="startingPrice"
              name="startingPrice"
              type="number"
              min="0"
              step="0.01"
              value={values.startingPrice}
              onChange={(e) => setField("startingPrice", e.target.value)}
              disabled={pending}
              placeholder="500"
            />
            {fieldError("startingPrice") && <FieldError message={fieldError("startingPrice")} />}
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              name="currency"
              value={values.currency}
              onChange={(e) => setField("currency", e.target.value)}
              disabled={pending}
              className="w-28"
            />
            {fieldError("currency") && <FieldError message={fieldError("currency")} />}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              value={values.sortOrder}
              onChange={(e) => setField("sortOrder", e.target.value)}
              disabled={pending}
              className="w-28"
            />
            {fieldError("sortOrder") && <FieldError message={fieldError("sortOrder")} />}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="deliveryDaysMin">Delivery days (min)</Label>
            <Input
              id="deliveryDaysMin"
              name="deliveryDaysMin"
              type="number"
              min="0"
              value={values.deliveryDaysMin}
              onChange={(e) => setField("deliveryDaysMin", e.target.value)}
              disabled={pending}
            />
            {fieldError("deliveryDaysMin") && <FieldError message={fieldError("deliveryDaysMin")} />}
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryDaysMax">Delivery days (max)</Label>
            <Input
              id="deliveryDaysMax"
              name="deliveryDaysMax"
              type="number"
              min="0"
              value={values.deliveryDaysMax}
              onChange={(e) => setField("deliveryDaysMax", e.target.value)}
              disabled={pending}
            />
            {fieldError("deliveryDaysMax") && <FieldError message={fieldError("deliveryDaysMax")} />}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Active</p>
            <p className="text-xs text-muted-foreground">
              Control if this service is visible across the site.
            </p>
          </div>
          <Switch
            checked={values.isActive}
            onCheckedChange={(checked) => setField("isActive", checked)}
            disabled={pending}
          />
          <input type="hidden" name="isActive" value={values.isActive ? "true" : "false"} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" && state.message && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </div>
      )}

      {showTabs ? (
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-0 space-y-4">
            {detailsFields}
          </TabsContent>

          <TabsContent value="packages" className="mt-0">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Packages</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Package builder will live here. For now, keep details updated and add packages later.
                </p>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="mt-0">
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-base">SEO</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Optional metadata to improve previews and social sharing.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta title</Label>
                  <Input
                    id="metaTitle"
                    name="metaTitle"
                    value={values.metaTitle}
                    onChange={(e) => setField("metaTitle", e.target.value)}
                    disabled={pending}
                    placeholder="Service meta title"
                  />
                  {fieldError("metaTitle") && <FieldError message={fieldError("metaTitle")} />}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta description</Label>
                  <Textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={values.metaDescription}
                    onChange={(e) => setField("metaDescription", e.target.value)}
                    disabled={pending}
                    rows={3}
                    placeholder="Short summary for search and social previews."
                  />
                  {fieldError("metaDescription") && (
                    <FieldError message={fieldError("metaDescription")} />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogImageUrl">OG image URL</Label>
                  <Input
                    id="ogImageUrl"
                    name="ogImageUrl"
                    value={values.ogImageUrl}
                    onChange={(e) => setField("ogImageUrl", e.target.value)}
                    disabled={pending}
                    placeholder="https://..."
                  />
                  {fieldError("ogImageUrl") && <FieldError message={fieldError("ogImageUrl")} />}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        detailsFields
      )}

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : mode === "create" ? "Create service" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}
