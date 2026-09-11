import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://taskflow.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/forgot-password"],
        disallow: ["/dashboard", "/dashboard/*", "/api/*", "/_next/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
