import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { marked } from "marked";
import type { Metadata } from "next";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug, published: true },
  });
  if (!article) return {};

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://multy.brewos.ru";

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.coverImage ? [article.coverImage] : [],
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      url: `${siteUrl}/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt ?? undefined,
    },
  };
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug, published: true },
  });

  if (!article) notFound();

  const html = await marked(article.content, { gfm: true, breaks: true });
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://multy.brewos.ru";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    url: `${siteUrl}/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "Multy.ai",
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        {article.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full rounded-xl mb-8 max-h-80 object-cover"
          />
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold mb-3">{article.title}</h1>
        {article.publishedAt && (
          <p className="text-gray-400 text-sm mb-8">
            {formatDate(article.publishedAt)}
          </p>
        )}
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </>
  );
}
