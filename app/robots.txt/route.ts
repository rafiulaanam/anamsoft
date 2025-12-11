import { NextResponse } from "next/server";

const siteUrl = "https://anamsoft.com";

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

export const revalidate = 86400; // 24 hours

export async function GET() {
  return new NextResponse(robots, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
