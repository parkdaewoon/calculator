import type { MetadataRoute } from "next";

const siteUrl = "https://www.nokobridge.com";
const lastModified = new Date("2026-05-07");

type RouteItem = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const routes: RouteItem[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/salary", changeFrequency: "weekly", priority: 0.9 },
  { path: "/salary/calculator", changeFrequency: "weekly", priority: 0.9 },
  { path: "/salary/pay-table", changeFrequency: "weekly", priority: 0.85 },
  { path: "/salary/allowances", changeFrequency: "weekly", priority: 0.8 },
  { path: "/salary/travel", changeFrequency: "weekly", priority: 0.7 },
  { path: "/pension", changeFrequency: "weekly", priority: 0.9 },
  { path: "/pension/calc", changeFrequency: "weekly", priority: 0.85 },
  { path: "/pension/severance", changeFrequency: "weekly", priority: 0.85 },
  { path: "/guide", changeFrequency: "weekly", priority: 0.85 },
  { path: "/guide/salary", changeFrequency: "monthly", priority: 0.8 },
  { path: "/guide/salary/actual-pay", changeFrequency: "monthly", priority: 0.75 },
  { path: "/guide/salary/allowance-basic", changeFrequency: "monthly", priority: 0.75 },
  { path: "/guide/salary/overtime", changeFrequency: "monthly", priority: 0.75 },
  { path: "/guide/pension", changeFrequency: "monthly", priority: 0.8 },
  { path: "/guide/pension/basic-income", changeFrequency: "monthly", priority: 0.75 },
  { path: "/guide/pension/retirement", changeFrequency: "monthly", priority: 0.75 },
  { path: "/guide/allowance", changeFrequency: "monthly", priority: 0.8 },
  { path: "/guide/calendar/shift-work", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/sources", changeFrequency: "yearly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
