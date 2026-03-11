import type { MetadataRoute } from "next";

const siteUrl = "https://nokobridge.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/salary",
    "/pension",
    "/calendar",
    "/privacy",
    "/terms",
    "/disclaimer",
    "/contact",
    "/sources",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}