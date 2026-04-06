import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ orgId: string; bookmarkId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, bookmarkId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const bookmark = await prisma.bookmark.findFirst({
    where: { id: bookmarkId, orgId, userId },
  });
  if (!bookmark) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.bookmark.delete({ where: { id: bookmarkId } });
  return NextResponse.json({ ok: true });
}
