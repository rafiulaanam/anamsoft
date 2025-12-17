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

export type ServicePackageWithItems = {
  id: string;
  serviceId: string;
  name: string;
  price: string;
  currency: string;
  deliveryDays: number | null;
  isRecommended: boolean;
  isActive: boolean;
  sortOrder: number;
  items: {
    id: string;
    packageId: string;
    text: string;
    sortOrder: number;
  }[];
};
