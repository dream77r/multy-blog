import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const published = searchParams.get("published");

  const articles = await prisma.article.findMany({
    where: published !== null ? { published: published === "true" } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      coverImageUrl: true,
      metaDescription: true,
      readingTime: true,
      faqJson: true,
      tocHtml: true,
      tags: true,
      published: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    coverImageUrl?: string;
    metaDescription?: string;
    readingTime?: number;
    faqJson?: Array<{ q: string; a: string }>;
    tocHtml?: string;
    tags?: string[];
    published?: boolean;
    publishedAt?: string;
  };

  if (!body.title || !body.slug || !body.content) {
    return NextResponse.json(
      { error: "title, slug, content are required" },
      { status: 400 }
    );
  }

  const article = await prisma.article.upsert({
    where: { slug: body.slug },
    create: {
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      coverImage: body.coverImage ?? body.coverImageUrl,
      coverImageUrl: body.coverImageUrl ?? body.coverImage,
      metaDescription: body.metaDescription,
      readingTime: body.readingTime,
      faqJson: body.faqJson ?? undefined,
      tocHtml: body.tocHtml,
      tags: body.tags ?? [],
      published: body.published ?? false,
      publishedAt: body.published
        ? (body.publishedAt ? new Date(body.publishedAt) : new Date())
        : null,
    },
    update: {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      coverImage: body.coverImage ?? body.coverImageUrl,
      coverImageUrl: body.coverImageUrl ?? body.coverImage,
      metaDescription: body.metaDescription,
      readingTime: body.readingTime,
      faqJson: body.faqJson ?? undefined,
      tocHtml: body.tocHtml,
      tags: body.tags ?? [],
      published: body.published ?? false,
      publishedAt: body.published
        ? (body.publishedAt ? new Date(body.publishedAt) : new Date())
        : null,
    },
  });

  return NextResponse.json(article, { status: 201 });
}
