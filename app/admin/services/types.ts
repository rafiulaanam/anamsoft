export type ServiceFormValues = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  imageUrl: string;
  startingPrice: string;
  currency: string;
  deliveryDaysMin: string;
  deliveryDaysMax: string;
  isActive: boolean;
  sortOrder: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
};

export type ServiceFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  id?: string;
};

export type ServicePackageWithFeatures = {
  id: string;
  serviceId: string;
  title: string | null;
  priceFrom: number | null;
  currency: string;
  description: string | null;
  features: string[];
  badge: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  isFeaturedOnLanding: boolean;
  deliveryDays: number | null;
  isRecommended: boolean;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
};
