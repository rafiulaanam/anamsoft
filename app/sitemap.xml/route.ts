import { NextResponse } from "next/server";

const siteUrl = "https://anamsoft.com";

const urls = [
  "/",
  "/admin",
  "/admin/services",
  "/admin/portfolio",
  "/admin/leads",
  "/admin/settings",
];

export const revalidate = 86400; // 24 hours

export async function GET() {
  const lastmod = new Date().toISOString();
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map((path) => {
        return `<url><loc>${siteUrl}${path}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
      })
      .join("\n")}
  </urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
