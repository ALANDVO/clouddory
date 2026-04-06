import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const tag = searchParams.get("tag");

  const posts = await prisma.blogPost.findMany({
    where: {
      status: "published",
      ...(tag
        ? { tags: { array_contains: tag } }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      authorName: true,
      tags: true,
      publishedAt: true,
      coverImage: true,
    },
  });

  return NextResponse.json({ posts }, { headers: corsHeaders });
}
