import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string; accountId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, accountId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const account = await prisma.cloudAccount.findFirst({
    where: { id: accountId, orgId },
    select: {
      id: true,
      provider: true,
      name: true,
      externalId: true,
      status: true,
      lastSyncAt: true,
      lastError: true,
      syncIntervalHours: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(account);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string; accountId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, accountId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!["owner", "admin"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verify the account belongs to this org
  const account = await prisma.cloudAccount.findFirst({
    where: { id: accountId, orgId },
  });
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete associated cost records first, then the account
  await prisma.costRecord.deleteMany({ where: { cloudAccountId: accountId } });
  await prisma.cloudAccount.delete({ where: { id: accountId } });

  return NextResponse.json({ success: true });
}
