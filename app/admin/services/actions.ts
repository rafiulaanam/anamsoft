"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { ServiceCreateSchema, ServiceUpdateSchema } from "@/lib/validators/service";
import type { ServiceFormState } from "./types";

const initialError = "Please review the form and try again.";
const MAX_FEATURED_PACKAGES = 3;
const MAX_FEATURES = 12;

type ActionResponse<T = undefined> = {
  ok: boolean;
  message?: string;
  data?: T;
};

function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

function parseOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseFormData(formData: FormData) {
  return {
    title: (formData.get("title") as string) ?? "",
    slug: (formData.get("slug") as string) ?? "",
    shortDescription: (formData.get("shortDescription") as string) ?? "",
    description: (formData.get("description") as string) ?? "",
    icon: parseOptionalString(formData.get("icon")),
    imageUrl: parseOptionalString(formData.get("imageUrl")),
    startingPrice: parseOptionalNumber(formData.get("startingPrice")),
    currency: (formData.get("currency") as string) ?? "EUR",
    deliveryDaysMin: parseOptionalNumber(formData.get("deliveryDaysMin")),
    deliveryDaysMax: parseOptionalNumber(formData.get("deliveryDaysMax")),
    isActive: (formData.get("isActive") as string) === "true",
    sortOrder: parseOptionalNumber(formData.get("sortOrder")),
    metaTitle: parseOptionalString(formData.get("metaTitle")),
    metaDescription: parseOptionalString(formData.get("metaDescription")),
    ogImageUrl: parseOptionalString(formData.get("ogImageUrl")),
  };
}

function mapFieldErrors(error: any) {
  if (!error?.flatten) return undefined;
  const flat = error.flatten();
  const fieldErrors: Record<string, string> = {};
  Object.entries(flat.fieldErrors || {}).forEach(([key, messages]) => {
    if (messages && messages.length > 0) {
      fieldErrors[key] = messages[0];
    }
  });
  return fieldErrors;
}

function toPrismaPayload(input: any) {
  return {
    title: input.title,
    slug: input.slug,
    shortDescription: input.shortDescription,
    description: input.description,
    icon: input.icon ?? null,
    imageUrl: input.imageUrl ?? null,
    startingPrice:
      input.startingPrice !== undefined ? new Prisma.Decimal(input.startingPrice) : null,
    currency: input.currency || "EUR",
    deliveryDaysMin: input.deliveryDaysMin !== undefined ? Number(input.deliveryDaysMin) : null,
    deliveryDaysMax: input.deliveryDaysMax !== undefined ? Number(input.deliveryDaysMax) : null,
    isActive: typeof input.isActive === "boolean" ? input.isActive : true,
    sortOrder: input.sortOrder !== undefined ? Number(input.sortOrder) : 0,
    metaTitle: input.metaTitle ?? null,
    metaDescription: input.metaDescription ?? null,
    ogImageUrl: input.ogImageUrl ?? null,
  };
}

function revalidateService(serviceId: string) {
  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${serviceId}`);
}

async function enforceFeaturedLimit(serviceId: string, keepId?: string) {
  const featured = await prisma.servicePackage.findMany({
    where: { serviceId, isFeaturedOnLanding: true },
    orderBy: { updatedAt: "asc" },
  });
  if (featured.length <= MAX_FEATURED_PACKAGES) {
    return [];
  }

  const overflow = featured.filter((pkg) => pkg.id !== keepId);
  const toUnfeature = Math.max(0, featured.length - MAX_FEATURED_PACKAGES);
  const targets = overflow.slice(0, toUnfeature);
  if (targets.length === 0) {
    return [];
  }

  await prisma.servicePackage.updateMany({
    where: { id: { in: targets.map((pkg) => pkg.id) } },
    data: { isFeaturedOnLanding: false },
  });

  return targets.map((pkg) => pkg.title ?? "Untitled package");
}

export async function createService(
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const parsed = ServiceCreateSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: initialError,
      fieldErrors: mapFieldErrors(parsed.error),
    };
  }

  try {
    const payload = toPrismaPayload(parsed.data);
    const service = await prisma.service.create({ data: payload });
    revalidateService(service.id);
    return { status: "success", message: "Service created", id: service.id };
  } catch (error: any) {
    console.error("Create service failed", error);
    if (error?.code === "P2002") {
      return {
        status: "error",
        message: "Slug must be unique",
        fieldErrors: { slug: "Slug must be unique" },
      };
    }
    return { status: "error", message: "Failed to create service. Please try again." };
  }
}

export async function updateService(
  id: string,
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const parsed = ServiceUpdateSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: initialError,
      fieldErrors: mapFieldErrors(parsed.error),
    };
  }

  try {
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return { status: "error", message: "Service not found." };
    }

    const payload = toPrismaPayload(parsed.data);
    await prisma.service.update({
      where: { id },
      data: payload,
    });
    revalidateService(id);
    return { status: "success", message: "Service updated", id };
  } catch (error: any) {
    console.error("Update service failed", error);
    if (error?.code === "P2002") {
      return {
        status: "error",
        message: "Slug must be unique",
        fieldErrors: { slug: "Slug must be unique" },
      };
    }
    return { status: "error", message: "Failed to update service. Please try again." };
  }
}

// -------- Packages --------

export async function fetchPackages(serviceId: string) {
  return prisma.servicePackage.findMany({
    where: { serviceId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createPackage(
  serviceId: string,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const title = (formData.get("title") as string)?.trim();
    const priceFrom = (formData.get("priceFrom") as string)?.trim();
    const deliveryDays = (formData.get("deliveryDays") as string)?.trim();
    const currency = ((formData.get("currency") as string) || "EUR").trim();
    const description = parseOptionalString(formData.get("description"));
    const badge = parseOptionalString(formData.get("badge"));
    const ctaLabel = parseOptionalString(formData.get("ctaLabel"));
    const ctaHref = parseOptionalString(formData.get("ctaHref"));
    const isFeaturedOnLanding = formData.get("isFeaturedOnLanding") === "true";
    const isRecommended = formData.get("isRecommended") === "true";
    const isActive = formData.get("isActive") !== "false";

    if (!title) {
      return { ok: false, message: "Title is required." };
    }

    const priceValue =
      priceFrom && priceFrom.length > 0 ? Number(priceFrom) : null;
    if (priceFrom && (Number.isNaN(priceValue) || priceValue <= 0)) {
      return { ok: false, message: "Price must be greater than 0." };
    }
    if (isFeaturedOnLanding && (priceValue === null || priceValue <= 0)) {
      return {
        ok: false,
        message: "Featured packages require a price greater than 0.",
      };
    }

    const sortOrder =
      ((await prisma.servicePackage.count({ where: { serviceId } })) || 0) + 1;

    if (isRecommended) {
      await prisma.servicePackage.updateMany({
        where: { serviceId },
        data: { isRecommended: false },
      });
    }

    const pkg = await prisma.servicePackage.create({
      data: {
        serviceId,
        title,
        priceFrom: priceValue,
        currency,
        description,
        badge,
        ctaLabel,
        ctaHref,
        isFeaturedOnLanding,
        deliveryDays: deliveryDays ? Number(deliveryDays) : null,
        isRecommended,
        isActive,
        sortOrder,
        features: [],
      },
    });

    revalidateService(serviceId);
    const unfeaturedTitles = await enforceFeaturedLimit(serviceId, pkg.id);
    const message =
      unfeaturedTitles.length > 0
        ? `Package added. ${unfeaturedTitles.join(
            ", "
          )} was unfeatured to keep ${MAX_FEATURED_PACKAGES} featured packages.`
        : "Package added";
    return { ok: true, data: pkg, message };
  } catch (error) {
    console.error("createPackage", error);
    return { ok: false, message: "Failed to create package" };
  }
}

export async function updatePackage(
  packageId: string,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const existing = await prisma.servicePackage.findUnique({ where: { id: packageId } });
    if (!existing) return { ok: false, message: "Package not found" };

    const title = parseOptionalString(formData.get("title")) ?? existing.title;
    const priceFromRaw = formData.get("priceFrom");
    const priceFromInput = typeof priceFromRaw === "string" ? priceFromRaw.trim() : "";
    let priceFromNumber: number | null;
    if (priceFromRaw === null) {
      priceFromNumber = existing.priceFrom;
    } else if (priceFromInput === "") {
      priceFromNumber = null;
    } else {
      priceFromNumber = Number(priceFromInput);
      if (Number.isNaN(priceFromNumber) || priceFromNumber < 0) {
        return { ok: false, message: "Price must be greater than 0." };
      }
    }
    const deliveryDaysValue = (formData.get("deliveryDays") as string)?.trim();
    const currency = ((formData.get("currency") as string)?.trim()) || existing.currency || "EUR";
    const description = parseOptionalString(formData.get("description"));
    const badge = parseOptionalString(formData.get("badge"));
    const ctaLabel = parseOptionalString(formData.get("ctaLabel"));
    const ctaHref = parseOptionalString(formData.get("ctaHref"));
    const isFeaturedOnLanding =
      formData.get("isFeaturedOnLanding") === "true"
        ? true
        : formData.get("isFeaturedOnLanding") === "false"
        ? false
        : existing.isFeaturedOnLanding;
    const isRecommended =
      formData.get("isRecommended") === "true" ? true : existing.isRecommended;
    const isActive =
      formData.get("isActive") === "true"
        ? true
        : formData.get("isActive") === "false"
        ? false
        : existing.isActive;

    if (isRecommended) {
      await prisma.servicePackage.updateMany({
        where: { serviceId: existing.serviceId },
        data: { isRecommended: false },
      });
    }

    if (isFeaturedOnLanding && (priceFromNumber === null || priceFromNumber <= 0)) {
      return {
        ok: false,
        message: "Featured packages require a price greater than 0.",
      };
    }

    const pkg = await prisma.servicePackage.update({
      where: { id: packageId },
      data: {
        title,
        priceFrom: priceFromNumber ?? existing.priceFrom,
        currency,
        description: description ?? existing.description,
        badge: badge ?? existing.badge,
        ctaLabel: ctaLabel ?? existing.ctaLabel,
        ctaHref: ctaHref ?? existing.ctaHref,
        isFeaturedOnLanding,
        deliveryDays: deliveryDaysValue ? Number(deliveryDaysValue) : existing.deliveryDays,
        isRecommended,
        isActive,
      },
    });

    revalidateService(existing.serviceId);
    const unfeaturedTitles = await enforceFeaturedLimit(existing.serviceId, pkg.id);
    const message =
      unfeaturedTitles.length > 0
        ? `Package updated. ${unfeaturedTitles.join(
            ", "
          )} was unfeatured to keep ${MAX_FEATURED_PACKAGES} featured packages.`
        : "Package updated";
    return { ok: true, data: pkg, message };
  } catch (error) {
    console.error("updatePackage", error);
    return { ok: false, message: "Failed to update package" };
  }
}

export async function deletePackage(packageId: string): Promise<ActionResponse> {
  try {
    const pkg = await prisma.servicePackage.delete({ where: { id: packageId } });
    revalidateService(pkg.serviceId);
    return { ok: true, message: "Package deleted" };
  } catch (error) {
    console.error("deletePackage", error);
    return { ok: false, message: "Failed to delete package" };
  }
}

export async function togglePackageActive(packageId: string): Promise<ActionResponse> {
  try {
    const pkg = await prisma.servicePackage.findUnique({ where: { id: packageId } });
    if (!pkg) return { ok: false, message: "Package not found" };
    const updated = await prisma.servicePackage.update({
      where: { id: packageId },
      data: { isActive: !pkg.isActive },
    });
    revalidateService(pkg.serviceId);
    return { ok: true, data: updated, message: updated.isActive ? "Activated" : "Deactivated" };
  } catch (error) {
    console.error("togglePackageActive", error);
    return { ok: false, message: "Failed to toggle package" };
  }
}

export async function setPackageRecommended(packageId: string): Promise<ActionResponse> {
  try {
    const pkg = await prisma.servicePackage.findUnique({ where: { id: packageId } });
    if (!pkg) return { ok: false, message: "Package not found" };

    await prisma.$transaction([
      prisma.servicePackage.updateMany({
        where: { serviceId: pkg.serviceId },
        data: { isRecommended: false },
      }),
      prisma.servicePackage.update({
        where: { id: packageId },
        data: { isRecommended: true },
      }),
    ]);

    const updated = await prisma.servicePackage.findMany({
      where: { serviceId: pkg.serviceId },
      orderBy: { sortOrder: "asc" },
    });

    revalidatePath(`/admin/services/${pkg.serviceId}`);
    return { ok: true, data: updated, message: "Marked as recommended" };
  } catch (error) {
    console.error("setPackageRecommended", error);
    return { ok: false, message: "Failed to update recommended package" };
  }
}

export async function movePackage(
  packageId: string,
  direction: "up" | "down"
): Promise<ActionResponse> {
  try {
    const pkg = await prisma.servicePackage.findUnique({ where: { id: packageId } });
    if (!pkg) return { ok: false, message: "Package not found" };

    const neighbor = await prisma.servicePackage.findFirst({
      where: {
        serviceId: pkg.serviceId,
        sortOrder: direction === "up" ? { lt: pkg.sortOrder } : { gt: pkg.sortOrder },
      } as any,
      orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
    });

    if (!neighbor) return { ok: true, data: pkg };

    await prisma.$transaction([
      prisma.servicePackage.update({
        where: { id: pkg.id },
        data: { sortOrder: neighbor.sortOrder },
      }),
      prisma.servicePackage.update({
        where: { id: neighbor.id },
        data: { sortOrder: pkg.sortOrder },
      }),
    ]);

    const updated = await fetchPackages(pkg.serviceId);
    revalidateService(pkg.serviceId);
    return { ok: true, data: updated, message: "Reordered" };
  } catch (error) {
    console.error("movePackage", error);
    return { ok: false, message: "Failed to reorder package" };
  }
}

// -------- Package features --------

async function mutatePackageFeatures(
  packageId: string,
  updater: (features: string[]) => string[],
  successMessage: string,
  failureMessage: string
): Promise<ActionResponse<string[]>> {
  try {
    const pkg = await prisma.servicePackage.findUnique({ where: { id: packageId } });
    if (!pkg) return { ok: false, message: "Package not found" };
    const updatedFeatures = updater(pkg.features ?? []);
    if (updatedFeatures.length > MAX_FEATURES) {
      return {
        ok: false,
        message: `Each package can only have up to ${MAX_FEATURES} features.`,
      };
    }
    const updated = await prisma.servicePackage.update({
      where: { id: packageId },
      data: { features: updatedFeatures },
    });
    revalidateService(pkg.serviceId);
    return { ok: true, data: updated.features, message: successMessage };
  } catch (error) {
    console.error("mutatePackageFeatures", error);
    return { ok: false, message: failureMessage };
  }
}

export async function addPackageFeature(
  packageId: string,
  text: string
): Promise<ActionResponse<string[]>> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, message: "Feature text is required." };
  return mutatePackageFeatures(
    packageId,
    (features) => [...features, trimmed],
    "Feature added",
    "Failed to add feature"
  );
}

export async function updatePackageFeature(
  packageId: string,
  index: number,
  text: string
): Promise<ActionResponse<string[]>> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, message: "Feature text is required." };
  return mutatePackageFeatures(
    packageId,
    (features) => {
      if (index < 0 || index >= features.length) return features;
      const next = [...features];
      next[index] = trimmed;
      return next;
    },
    "Feature updated",
    "Failed to update feature"
  );
}

export async function deletePackageFeature(
  packageId: string,
  index: number
): Promise<ActionResponse<string[]>> {
  return mutatePackageFeatures(
    packageId,
    (features) => {
      if (index < 0 || index >= features.length) return features;
      return [...features.slice(0, index), ...features.slice(index + 1)];
    },
    "Feature deleted",
    "Failed to remove feature"
  );
}

export async function movePackageFeature(
  packageId: string,
  index: number,
  direction: "up" | "down"
): Promise<ActionResponse<string[]>> {
  return mutatePackageFeatures(
    packageId,
    (features) => {
      if (index < 0 || index >= features.length) return features;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= features.length) return features;
      const next = [...features];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    },
    "Feature reordered",
    "Failed to reorder feature"
  );
}
