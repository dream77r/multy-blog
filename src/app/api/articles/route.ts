import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      tags: true,
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

  const body = await request.json();
  const { title, slug, content, excerpt, coverImage, tags } = body;

  if (!title || !slug || !content) {
    return NextResponse.json(
      { error: "title, slug, content are required" },
      { status: 400 }
    );
  }

  const article = await prisma.article.create({
    data: { title, slug, content, excerpt, coverImage, tags: tags ?? [] },
  });

  return NextResponse.json(article, { status: 201 });
}
