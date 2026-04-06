import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("superadmin_session");
  if (!session?.value) {
    return null;
  }
  return true;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;
  const body = await req.json();
  const { title, excerpt, content, tags, status, coverImage } = body;

  const existing = await prisma.blogPost.findUnique({
    where: { id: postId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // If status is changing to published and not previously published, set publishedAt
  const publishedAt =
    status === "published" && !existing.publishedAt
      ? new Date()
      : existing.publishedAt;

  const post = await prisma.blogPost.update({
    where: { id: postId },
    data: {
      ...(title !== undefined && { title }),
      ...(excerpt !== undefined && { excerpt }),
      ...(content !== undefined && { content }),
      ...(tags !== undefined && { tags }),
      ...(status !== undefined && { status }),
      ...(coverImage !== undefined && { coverImage }),
      publishedAt,
    },
  });

  return NextResponse.json({ post });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;

  await prisma.blogPost.delete({ where: { id: postId } });

  return NextResponse.json({ success: true });
}
