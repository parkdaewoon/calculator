import type { MetadataRoute } from "next";

const siteUrl = "https://www.nokobridge.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${siteUrl}/salary`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/pension`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/calendar`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "weekly",
      priority: 0.9,
    },

    {
      url: `${siteUrl}/guide`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/guide/salary`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/guide/pension`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/guide/allowance`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${siteUrl}/salary/pay-table`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/salary/calculator`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/salary/allowances`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/salary/travel`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "weekly",
      priority: 0.7,
    },

    {
      url: `${siteUrl}/pension/basic`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/pension/calc`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/pension/compare`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/pension/severance`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${siteUrl}/pwa-install`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/sources`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/disclaimer`,
      lastModified: new Date("2026-04-09"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}