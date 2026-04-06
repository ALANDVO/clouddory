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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "published" },
  });

  if (!post) {
    return NextResponse.json(
      { error: "Post not found" },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json({ post }, { headers: corsHeaders });
}
