import type { Service } from "@prisma/client";
import type { ServiceFormValues } from "./types";

export function serviceToFormValues(service: Service): ServiceFormValues {
  return {
    title: service.title,
    slug: service.slug,
    shortDescription: service.shortDescription,
    description: service.description,
    icon: service.icon ?? "",
    imageUrl: service.imageUrl ?? "",
    startingPrice: service.startingPrice ? service.startingPrice.toString() : "",
    currency: service.currency ?? "EUR",
    deliveryDaysMin: service.deliveryDaysMin != null ? service.deliveryDaysMin.toString() : "",
    deliveryDaysMax: service.deliveryDaysMax != null ? service.deliveryDaysMax.toString() : "",
    isActive: service.isActive,
    sortOrder: service.sortOrder !== undefined ? service.sortOrder.toString() : "",
    metaTitle: service.metaTitle ?? "",
    metaDescription: service.metaDescription ?? "",
    ogImageUrl: service.ogImageUrl ?? "",
  };
}
