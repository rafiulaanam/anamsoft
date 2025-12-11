import React from "react";

interface Address {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

interface LocalBusinessSchemaProps {
  name: string;
  url: string;
  telephone: string;
  email: string;
  address: Address;
  sameAs?: string[];
}

export function LocalBusinessSchema({ name, url, telephone, email, address, sameAs = [] }: LocalBusinessSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "BeautySalon"],
    name,
    url,
    telephone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      postalCode: address.postalCode,
      addressCountry: address.addressCountry,
    },
    areaServed: "Vilnius",
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}
