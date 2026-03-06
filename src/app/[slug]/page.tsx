import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { marked } from "marked";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

interface FaqItem { q: string; a: string }
interface Props { params: Promise<{ slug: string }> }

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
    openGraph: { title: article.title, description: desc, images: image ? [image] : [], type: "article", publishedTime: article.publishedAt?.toISOString(), url: `${siteUrl}/${slug}` },
    twitter: { card: "summary_large_image", title: article.title, description: desc, images: image ? [image] : [] },
  };
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("ru-RU", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date));
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) notFound();

  const html = await marked(article.content, { gfm: true, breaks: true });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://multy.brewos.ru";
  const coverImg = article.coverImageUrl ?? article.coverImage;
  const desc = article.metaDescription ?? article.excerpt;
  const readTime = article.readingTime ?? Math.max(1, Math.round(article.content.trim().split(/\s+/).length / 200));
  const faqItems = (article.faqJson as FaqItem[] | null) ?? [];
  const primaryTag = article.tags[0] ?? null;

  const blogPostingLd = {
    "@context": "https://schema.org", "@type": "BlogPosting",
    headline: article.title, description: desc, image: coverImg,
    datePublished: article.publishedAt?.toISOString(), dateModified: article.updatedAt.toISOString(),
    url: `${siteUrl}/${slug}`, timeRequired: `PT${readTime}M`,
    publisher: { "@type": "Organization", name: "Multy.ai", url: siteUrl },
    author: { "@type": "Organization", name: "Multy.ai" },
  };

  const faqLd = faqItems.length > 0 ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <Link href="/" className="back-link">← Все статьи</Link>

      <article className="article-page">
        {article.tags.length > 0 && (
          <div className="article-tags">
            {article.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
          </div>
        )}

        <h1>{article.title}</h1>

        <div className="article-page-meta">
          <span className="meta-clock">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {readTime} мин чтения
          </span>
          {article.publishedAt && <><span className="meta-dot">·</span><span>{formatDate(article.publishedAt)}</span></>}
          {primaryTag && <><span className="meta-dot">·</span><span className="meta-category">{primaryTag}</span></>}
          {!article.published && <span className="draft-badge">Черновик</span>}
        </div>

        {coverImg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImg} alt={article.title} className="article-cover" />
        )}

        {article.excerpt && <p className="article-lead">{article.excerpt}</p>}

        {article.tocHtml && (
          <div className="toc-block">
            <div className="toc-title">Содержание</div>
            <div className="toc" dangerouslySetInnerHTML={{ __html: article.tocHtml }} />
          </div>
        )}

        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        {faqItems.length > 0 && (
          <section className="faq-section">
            <h2>Часто задаваемые вопросы</h2>
            {faqItems.map((item, i) => (
              <details key={i} className="faq-item">
                <summary>
                  {item.q}
                  <svg className="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="faq-answer">{item.a}</div>
              </details>
            ))}
          </section>
        )}

        <div className="cta-block">
          <div className="cta-inner">
            <div className="cta-brand">Multy.ai</div>
            <div className="cta-text">AI-автоматизация для вашего бизнеса</div>
            <div className="cta-buttons">
              <a
                href={`https://t.me/MultyBoost_bot?start=${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-btn cta-btn-primary"
              >
                🤖 Попробовать бота
              </a>
              <a
                href={`https://multy.ai?utm_source=blog&utm_medium=article&utm_campaign=${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-btn cta-btn-secondary"
              >
                Узнать больше →
              </a>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
