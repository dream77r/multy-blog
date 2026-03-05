import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as { slug?: string; slugs?: string[] };
  const slugs = body.slugs ?? (body.slug ? [body.slug] : []);

  if (!slugs.length) {
    return NextResponse.json({ error: "slug or slugs required" }, { status: 400 });
  }

  const results = await Promise.all(
    slugs.map((slug) =>
      prisma.article.updateMany({
        where: { slug },
        data: { published: true, publishedAt: new Date() },
      })
    )
  );

  const total = results.reduce((s, r) => s + r.count, 0);
  return NextResponse.json({ published: total, slugs });
}
