import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "공무원 노트",
    short_name: "공무원노트",
    description: "봉급·수당·연금 계산과 달력을 한 곳에서",

    start_url: "/",
    scope: "/",

    display: "standalone",

    background_color: "#ffffff",
    theme_color: "#ffffff",

    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any"
      }
    ]
  };
}