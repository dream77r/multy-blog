import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 60;

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("ru-RU", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date));
}

function readTime(content: string): string {
  return `${Math.max(1, Math.round(content.trim().split(/\s+/).length / 200))} мин`;
}

export default async function HomePage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, coverImageUrl: true, tags: true, publishedAt: true, content: true },
  });

  return (
    <>
      <div className="home-hero">
        <h1>Multy Blog</h1>
        <p>Практические статьи об AI-автоматизации, Telegram и продажах</p>
      </div>

      {articles.length === 0 && (
        <div className="no-articles"><p>Статьи пока не опубликованы</p></div>
      )}

      <div className="articles-list">
        {articles.map((article) => {
          const cover = article.coverImageUrl ?? article.coverImage;
          return (
            <div key={article.id} className="article-card">
              <Link href={`/${article.slug}`}>
                <div className="article-body">
                  {article.tags.length > 0 && (
                    <div className="article-tags">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="article-title">{article.title}</div>
                  {article.excerpt && <div className="article-excerpt">{article.excerpt}</div>}
                  <div className="article-meta">
                    {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
                    <span className="article-meta-dot">·</span>
                    <span>{readTime(article.content)} чтения</span>
                  </div>
                </div>
                {cover && (
                  <div className="article-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover} alt={article.title} />
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
