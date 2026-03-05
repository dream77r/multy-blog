import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://multy.brewos.ru";

  const articles = await prisma.article.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  return [
    { url: siteUrl, lastModified: new Date() },
    ...articles.map((a) => ({
      url: `${siteUrl}/${a.slug}`,
      lastModified: a.updatedAt,
    })),
  ];
}
