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

export default async function HomePage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      tags: true,
      publishedAt: true,
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Последние статьи</h1>
      {articles.length === 0 && (
        <p className="text-gray-500">Статьи пока не опубликованы.</p>
      )}
      <div className="space-y-8">
        {articles.map((article) => (
          <article key={article.id} className="border-b border-gray-100 pb-8">
            <Link href={`/${article.slug}`} className="group">
              <h2 className="text-xl font-semibold group-hover:text-[#2563EB] transition-colors mb-2">
                {article.title}
              </h2>
            </Link>
            {article.excerpt && (
              <p className="text-gray-600 mb-3">{article.excerpt}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {article.publishedAt && (
                <span className="text-gray-400">
                  {formatDate(article.publishedAt)}
                </span>
              )}
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
