import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string; queryId: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, queryId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify the query belongs to this org
  const query = await prisma.savedQuery.findFirst({
    where: { id: queryId, orgId },
  });
  if (!query)
    return NextResponse.json({ error: "Query not found" }, { status: 404 });

  await prisma.savedQuery.delete({ where: { id: queryId } });

  return NextResponse.json({ success: true });
}
