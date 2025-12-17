"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { ServiceCreateSchema, ServiceUpdateSchema } from "@/lib/validators/service";
import type { ServiceFormState } from "./types";

const initialError = "Please review the form and try again.";

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
  const packages = await prisma.servicePackage.findMany({
    where: { serviceId },
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  return packages;
}

export async function createPackage(
  serviceId: string,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const name = (formData.get("name") as string)?.trim();
    const price = (formData.get("price") as string)?.trim();
    const currency = ((formData.get("currency") as string) || "EUR").trim();
    const deliveryDays = (formData.get("deliveryDays") as string)?.trim();
    const isRecommended = formData.get("isRecommended") === "true";
    const isActive = formData.get("isActive") !== "false";

    if (!name || !price) {
      return { ok: false, message: "Name and price are required." };
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
        name,
        price: new Prisma.Decimal(price),
        currency,
        deliveryDays: deliveryDays ? Number(deliveryDays) : null,
        isRecommended,
        isActive,
        sortOrder,
      },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    revalidateService(serviceId);
    return { ok: true, data: pkg, message: "Package added" };
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

    const name = (formData.get("name") as string)?.trim() || existing.name;
    const price = (formData.get("price") as string)?.trim() || existing.price.toString();
    const currency = ((formData.get("currency") as string) || existing.currency).trim();
    const deliveryDays = (formData.get("deliveryDays") as string)?.trim();
    const isActive = formData.get("isActive") === "true" ? true : formData.get("isActive") === "false" ? false : existing.isActive;
    const isRecommended = formData.get("isRecommended") === "true" ? true : existing.isRecommended;

    if (isRecommended) {
      await prisma.servicePackage.updateMany({
        where: { serviceId: existing.serviceId },
        data: { isRecommended: false },
      });
    }

    const pkg = await prisma.servicePackage.update({
      where: { id: packageId },
      data: {
        name,
        price: new Prisma.Decimal(price),
        currency,
        deliveryDays: deliveryDays ? Number(deliveryDays) : null,
        isActive,
        isRecommended,
      },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    revalidateService(existing.serviceId);
    return { ok: true, data: pkg, message: "Package updated" };
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
      include: { items: { orderBy: { sortOrder: "asc" } } },
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
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    revalidatePath(`/admin/services/${pkg.serviceId}`);
    return { ok: true, data: updated, message: "Marked as recommended" };
  } catch (error) {
    console.error("setPackageRecommended", error);
    return { ok: false, message: "Failed to update recommended package" };
  }
}

export async function movePackage(packageId: string, direction: "up" | "down"): Promise<ActionResponse> {
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

// -------- Package items --------

export async function createPackageItem(
  packageId: string,
  text: string
): Promise<ActionResponse> {
  try {
    const pkg = await prisma.servicePackage.findUnique({ where: { id: packageId } });
    if (!pkg) return { ok: false, message: "Package not found" };

    const sortOrder =
      ((await prisma.servicePackageItem.count({ where: { packageId } })) || 0) + 1;

    const item = await prisma.servicePackageItem.create({
      data: {
        packageId,
        text,
        sortOrder,
      },
    });
    revalidatePath(`/admin/services/${pkg.serviceId}`);
    return { ok: true, data: item, message: "Item added" };
  } catch (error) {
    console.error("createPackageItem", error);
    return { ok: false, message: "Failed to add item" };
  }
}

export async function updatePackageItem(
  itemId: string,
  text: string
): Promise<ActionResponse> {
  try {
    const item = await prisma.servicePackageItem.update({
      where: { id: itemId },
      data: { text },
    });
    const pkg = await prisma.servicePackage.findUnique({ where: { id: item.packageId } });
    if (pkg) revalidateService(pkg.serviceId);
    return { ok: true, data: item, message: "Item updated" };
  } catch (error) {
    console.error("updatePackageItem", error);
    return { ok: false, message: "Failed to update item" };
  }
}

export async function deletePackageItem(itemId: string): Promise<ActionResponse> {
  try {
    const item = await prisma.servicePackageItem.delete({ where: { id: itemId } });
    const pkg = await prisma.servicePackage.findUnique({ where: { id: item.packageId } });
    if (pkg) revalidateService(pkg.serviceId);
    return { ok: true, message: "Item deleted" };
  } catch (error) {
    console.error("deletePackageItem", error);
    return { ok: false, message: "Failed to delete item" };
  }
}

export async function movePackageItem(
  itemId: string,
  direction: "up" | "down"
): Promise<ActionResponse> {
  try {
    const item = await prisma.servicePackageItem.findUnique({ where: { id: itemId } });
    if (!item) return { ok: false, message: "Item not found" };

    const neighbor = await prisma.servicePackageItem.findFirst({
      where: {
        packageId: item.packageId,
        sortOrder: direction === "up" ? { lt: item.sortOrder } : { gt: item.sortOrder },
      } as any,
      orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
    });

    if (!neighbor) return { ok: true, data: item };

    await prisma.$transaction([
      prisma.servicePackageItem.update({
        where: { id: item.id },
        data: { sortOrder: neighbor.sortOrder },
      }),
      prisma.servicePackageItem.update({
        where: { id: neighbor.id },
        data: { sortOrder: item.sortOrder },
      }),
    ]);

    const items = await prisma.servicePackageItem.findMany({
      where: { packageId: item.packageId },
      orderBy: { sortOrder: "asc" },
    });
    const pkg = await prisma.servicePackage.findUnique({ where: { id: item.packageId } });
    if (pkg) revalidateService(pkg.serviceId);
    return { ok: true, data: items, message: "Item reordered" };
  } catch (error) {
    console.error("movePackageItem", error);
    return { ok: false, message: "Failed to reorder item" };
  }
}
