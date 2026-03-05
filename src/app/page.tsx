import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 60;

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
  return `${minutes} мин`;
}

export default async function HomePage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      tags: true,
      publishedAt: true,
      content: true,
    },
  });

  return (
    <div>
      {/* Hero */}
      <div className="mb-12 pb-10 border-b border-gray-100">
        <h1
          className="text-4xl font-bold text-gray-900 mb-3 leading-tight"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          Multy Blog
        </h1>
        <p className="text-lg text-gray-500" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
          Практические статьи об AI-автоматизации, Telegram и продажах
        </p>
      </div>

      {articles.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Статьи пока не опубликованы</p>
        </div>
      )}

      <div className="space-y-0 divide-y divide-gray-100">
        {articles.map((article, i) => (
          <article key={article.id} className="py-8 group">
            <Link href={`/${article.slug}`} className="block">
              <div className={`flex gap-6 ${article.coverImage ? 'items-start' : ''}`}>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Tags */}
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full"
                          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h2
                    className="text-xl font-bold text-gray-900 group-hover:text-[#2563EB] transition-colors leading-snug mb-2"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    {article.title}
                  </h2>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p
                      className="text-gray-500 leading-relaxed line-clamp-2 mb-3 text-base"
                      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                    >
                      {article.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div
                    className="flex items-center gap-3 text-sm text-gray-400"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    {article.publishedAt && (
                      <span>{formatDate(article.publishedAt)}</span>
                    )}
                    <span>·</span>
                    <span>{readTime(article.content)} чтения</span>
                  </div>
                </div>

                {/* Cover image thumbnail */}
                {article.coverImage && (
                  <div className="flex-shrink-0 w-28 h-20 md:w-36 md:h-24 rounded-lg overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
