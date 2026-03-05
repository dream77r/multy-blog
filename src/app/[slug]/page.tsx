import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { marked } from "marked";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, OR: [{ published: true }] },
  });
  if (!article) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://multy.brewos.ru";

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

function readTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} мин чтения`;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  // Fetch published OR unpublished (for preview)
  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article) notFound();

  const html = await marked(article.content, { gfm: true, breaks: true });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://multy.brewos.ru";

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

      {/* Back link */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#2563EB] transition-colors"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          ← Все статьи
        </Link>
      </div>

      <article>
        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-full"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1
          className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          {article.title}
        </h1>

        {/* Meta */}
        <div
          className="flex items-center gap-3 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
          <span>·</span>
          <span>{readTime(article.content)}</span>
          {!article.published && (
            <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded font-medium">
              Черновик
            </span>
          )}
        </div>

        {/* Cover image */}
        {article.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full rounded-xl mb-8 max-h-96 object-cover"
          />
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <p
            className="text-lg text-gray-600 leading-relaxed mb-8 font-medium border-l-4 border-[#2563EB] pl-4"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            {article.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <div className="bg-blue-50 rounded-2xl p-6 text-center">
            <p
              className="text-sm font-semibold text-[#2563EB] mb-1"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Multy.ai
            </p>
            <p
              className="text-gray-600 mb-4 text-sm"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              AI-автоматизация для вашего бизнеса
            </p>
            <a
              href="https://multy.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#2563EB] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Узнать больше →
            </a>
          </div>
        </div>
      </article>
    </>
  );
}
