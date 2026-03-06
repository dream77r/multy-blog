import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { marked } from "marked";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

interface FaqItem { q: string; a: string }

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://multy.brewos.ru";
  const desc = article.metaDescription ?? article.excerpt ?? undefined;
  const image = article.coverImageUrl ?? article.coverImage ?? undefined;

  return {
    title: article.title,
    description: desc,
    openGraph: {
      title: article.title,
      description: desc,
      images: image ? [image] : [],
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      url: `${siteUrl}/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: desc,
      images: image ? [image] : [],
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

function calcReadingTime(content: string): number {
  return Math.max(1, Math.round(content.trim().split(/\s+/).length / 200));
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) notFound();

  const html = await marked(article.content, { gfm: true, breaks: true });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://multy.brewos.ru";
  const coverImg = article.coverImageUrl ?? article.coverImage;
  const desc = article.metaDescription ?? article.excerpt;
  const readTime = article.readingTime ?? calcReadingTime(article.content);
  const faqItems = (article.faqJson as FaqItem[] | null) ?? [];
  const primaryTag = article.tags[0] ?? null;

  // JSON-LD: BlogPosting
  const blogPostingLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: desc,
    image: coverImg,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    url: `${siteUrl}/${slug}`,
    timeRequired: `PT${readTime}M`,
    publisher: {
      "@type": "Organization",
      name: "Multy.ai",
      url: siteUrl,
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    },
    author: {
      "@type": "Organization",
      name: "Multy.ai",
    },
  };

  // JSON-LD: FAQPage
  const faqLd = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* Back */}
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

        {/* Meta row: время чтения + дата + категория */}
        <div
          className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {readTime} мин чтения
          </span>
          {article.publishedAt && (
            <>
              <span>·</span>
              <span>{formatDate(article.publishedAt)}</span>
            </>
          )}
          {primaryTag && (
            <>
              <span>·</span>
              <span className="text-[#2563EB]">{primaryTag}</span>
            </>
          )}
          {!article.published && (
            <span className="ml-auto bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded font-medium">
              Черновик
            </span>
          )}
        </div>

        {/* Cover image */}
        {coverImg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImg}
            alt={article.title}
            className="w-full rounded-xl mb-8 max-h-96 object-cover"
          />
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <p
            className="text-lg text-gray-600 leading-relaxed mb-8 border-l-4 border-[#2563EB] pl-4 italic"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            {article.excerpt}
          </p>
        )}

        {/* Table of Contents */}
        {article.tocHtml && (
          <div
            className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide text-xs">
              Содержание
            </p>
            <div
              className="toc text-sm text-gray-600 space-y-1"
              dangerouslySetInnerHTML={{ __html: article.tocHtml }}
            />
          </div>
        )}

        {/* Article content */}
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        {/* FAQ */}
        {faqItems.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-100">
            <h2
              className="text-xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Часто задаваемые вопросы
            </h2>
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <details
                  key={i}
                  className="group border border-gray-100 rounded-xl overflow-hidden"
                >
                  <summary
                    className="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 transition-colors list-none"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    {item.q}
                    <svg
                      className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div
                    className="px-4 pb-4 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-3"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center">
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
